import { Injectable } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DockerRunnerService } from '../docker/docker-runner.service';
import { SandboxExecutionResult } from '../sandbox.types';
import { SandboxRunner } from './sandbox-runner.interface';

const PYTHON_RUNNER_IMAGE = 'edtronaut-python-runner';
const PYTHON_ENTRY_FILE = 'main.py';

@Injectable()
export class PythonRunner implements SandboxRunner {
  constructor(private readonly dockerRunnerService: DockerRunnerService) {}

  supports(language: string): boolean {
    return ['python', 'py'].includes(language.trim().toLowerCase());
  }

  async run(sourceCode: string): Promise<SandboxExecutionResult> {
    const tempDir = await mkdtemp(join(tmpdir(), 'edtronaut-python-'));
    const sourceFile = join(tempDir, PYTHON_ENTRY_FILE);

    try {
      await writeFile(sourceFile, sourceCode, 'utf8');

      return await this.dockerRunnerService.runContainer({
        image: PYTHON_RUNNER_IMAGE,
        command: ['python3', '-B', `/workspace/${PYTHON_ENTRY_FILE}`],
        tempDir,
        timeoutMs: 5000,
        memory: '128m',
        memorySwap: '128m',
        cpus: 0.5,
        pidsLimit: 64,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
