import { Injectable } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DockerRunnerService } from '../docker/docker-runner.service';
import { SandboxExecutionResult } from '../sandbox.types';
import { SandboxRunner } from './sandbox-runner.interface';

const NODE_RUNNER_IMAGE = 'edtronaut-node-runner';
const TYPESCRIPT_ENTRY_FILE = 'main.ts';

@Injectable()
export class TypescriptRunner implements SandboxRunner {
  constructor(private readonly dockerRunnerService: DockerRunnerService) {}

  supports(language: string): boolean {
    return ['typescript', 'ts'].includes(language.trim().toLowerCase());
  }

  async run(sourceCode: string): Promise<SandboxExecutionResult> {
    const tempDir = await mkdtemp(join(tmpdir(), 'edtronaut-typescript-'));
    const sourceFile = join(tempDir, TYPESCRIPT_ENTRY_FILE);

    try {
      await writeFile(sourceFile, sourceCode, 'utf8');

      return await this.dockerRunnerService.runContainer({
        image: NODE_RUNNER_IMAGE,
        command: ['tsx', `/workspace/${TYPESCRIPT_ENTRY_FILE}`],
        tempDir,
        timeoutMs: 5000,
        memory: '192m',
        memorySwap: '192m',
        cpus: 0.5,
        pidsLimit: 64,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
