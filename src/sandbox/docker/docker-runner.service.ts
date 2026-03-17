import { Injectable } from '@nestjs/common';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { DockerRunRequest, DockerRunResult } from './docker-runner.types';

const execFileAsync = promisify(execFile);
const DOCKER_EXIT_TIMEOUT = 124;

@Injectable()
export class DockerRunnerService {
  async runContainer(request: DockerRunRequest): Promise<DockerRunResult> {
    await this.ensureDockerAvailable();
    await this.ensureImageExists(request.image);

    const containerName = this.createContainerName(request.image);
    const args = this.buildDockerArgs(request, containerName);
    const startedAt = Date.now();

    return new Promise<DockerRunResult>((resolve, reject) => {
      const child = spawn('docker', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let resolved = false;
      let timeoutTriggered = false;

      const finish = (result: DockerRunResult) => {
        if (resolved) {
          return;
        }

        resolved = true;
        resolve(result);
      };

      const fail = (error: Error) => {
        if (resolved) {
          return;
        }

        resolved = true;
        reject(error);
      };

      const timer = setTimeout(() => {
        timeoutTriggered = true;
        child.kill('SIGKILL');
        void this.forceRemoveContainer(containerName);
      }, request.timeoutMs);

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');

      child.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });

      child.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });

      child.on('error', (error) => {
        clearTimeout(timer);

        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          fail(
            new Error(
              'Docker binary was not found. Install Docker and ensure it is available in PATH.',
            ),
          );
          return;
        }

        fail(error);
      });

      child.on('close', (exitCode) => {
        clearTimeout(timer);

        const executionTimeMs = Date.now() - startedAt;
        const normalizedStdout = this.normalizeOutput(stdout);
        const normalizedStderr = this.normalizeOutput(stderr);

        if (timeoutTriggered) {
          finish({
            stdout: normalizedStdout,
            stderr:
              normalizedStderr ??
              `Execution timed out after ${request.timeoutMs}ms.`,
            exitCode: DOCKER_EXIT_TIMEOUT,
            executionTimeMs,
            timedOut: true,
          });
          return;
        }

        if (this.isDockerInfrastructureFailure(exitCode, normalizedStderr)) {
          fail(
            new Error(
              normalizedStderr ??
                `Docker failed to run image ${request.image}. Ensure the image exists and Docker is healthy.`,
            ),
          );
          return;
        }

        finish({
          stdout: normalizedStdout,
          stderr: normalizedStderr,
          exitCode: exitCode ?? 1,
          executionTimeMs,
          timedOut: false,
        });
      });
    });
  }

  private buildDockerArgs(
    request: DockerRunRequest,
    containerName: string,
  ): string[] {
    return [
      'run',
      '--rm',
      '--name',
      containerName,
      '--network',
      'none',
      '--read-only',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges=true',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=64m',
      '--tmpfs',
      '/run:rw,noexec,nosuid,size=16m',
      '--mount',
      `type=bind,src=${request.tempDir},dst=/workspace,readonly`,
      '--memory',
      request.memory,
      '--memory-swap',
      request.memorySwap,
      '--cpus',
      String(request.cpus),
      '--pids-limit',
      String(request.pidsLimit),
      request.image,
      ...request.command,
    ];
  }

  private createContainerName(image: string): string {
    const sanitizedImage = image.replace(/[^a-zA-Z0-9_.-]/g, '-');
    return `${sanitizedImage}-${process.pid}-${Date.now()}`;
  }

  private normalizeOutput(output: string): string | null {
    return output.length > 0 ? output : null;
  }

  private isDockerInfrastructureFailure(
    exitCode: number | null,
    stderr: string | null,
  ): boolean {
    if (exitCode === 125 || exitCode === 126 || exitCode === 127) {
      return true;
    }

    if (!stderr) {
      return false;
    }

    return (
      stderr.includes('Unable to find image') ||
      stderr.includes('pull access denied') ||
      stderr.includes('Cannot connect to the Docker daemon') ||
      stderr.includes('docker: permission denied')
    );
  }

  private async ensureDockerAvailable(): Promise<void> {
    try {
      await execFileAsync('docker', ['version', '--format', '{{.Server.Version}}']);
    } catch (error) {
      const cause = error as NodeJS.ErrnoException & { stderr?: string };

      if (cause.code === 'ENOENT') {
        throw new Error(
          'Docker binary was not found. Install Docker and ensure it is available in PATH.',
        );
      }

      throw new Error(
        cause.stderr?.trim() ||
          'Docker is not available. Ensure the Docker daemon is running.',
      );
    }
  }

  private async ensureImageExists(image: string): Promise<void> {
    try {
      await execFileAsync('docker', ['image', 'inspect', image]);
    } catch {
      throw new Error(
        `Docker image "${image}" was not found. Build it before running sandbox executions.`,
      );
    }
  }

  private async forceRemoveContainer(containerName: string): Promise<void> {
    try {
      await execFileAsync('docker', ['rm', '-f', containerName]);
    } catch {
      // Ignore cleanup failures because the original timeout/error is more important.
    }
  }
}
