import { Injectable } from '@nestjs/common';
import { SandboxExecutionResult } from '../sandbox.types';
import { SandboxRunner } from './sandbox-runner.interface';

@Injectable()
export class PythonRunner implements SandboxRunner {
  supports(language: string): boolean {
    return ['python', 'py'].includes(language.trim().toLowerCase());
  }

  async run(_sourceCode: string): Promise<SandboxExecutionResult> {
    return {
      stdout: 'Hello from Python sandbox',
      stderr: null,
      exitCode: 0,
      executionTimeMs: 1000,
    };
  }
}
