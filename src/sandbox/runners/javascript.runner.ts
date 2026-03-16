import { Injectable } from '@nestjs/common';
import { SandboxExecutionResult } from '../sandbox.types';
import { SandboxRunner } from './sandbox-runner.interface';

@Injectable()
export class JavascriptRunner implements SandboxRunner {
  supports(language: string): boolean {
    return ['javascript', 'js', 'node'].includes(
      language.trim().toLowerCase(),
    );
  }

  async run(_sourceCode: string): Promise<SandboxExecutionResult> {
    return {
      stdout: 'Hello from JavaScript sandbox',
      stderr: null,
      exitCode: 0,
      executionTimeMs: 1000,
    };
  }
}
