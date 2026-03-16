import { Injectable } from '@nestjs/common';
import { SandboxExecutionResult } from '../sandbox.types';
import { SandboxRunner } from './sandbox-runner.interface';

@Injectable()
export class TypescriptRunner implements SandboxRunner {
  supports(language: string): boolean {
    return ['typescript', 'ts'].includes(language.trim().toLowerCase());
  }

  async run(_sourceCode: string): Promise<SandboxExecutionResult> {
    return {
      stdout: 'Hello from TypeScript sandbox',
      stderr: null,
      exitCode: 0,
      executionTimeMs: 1000,
    };
  }
}
