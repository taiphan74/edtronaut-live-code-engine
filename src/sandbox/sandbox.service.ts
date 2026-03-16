import { Inject, Injectable } from '@nestjs/common';
import { SandboxRunner } from './runners/sandbox-runner.interface';
import { SandboxExecutionResult } from './sandbox.types';

export const SANDBOX_RUNNERS = Symbol('SANDBOX_RUNNERS');

@Injectable()
export class SandboxService {
  constructor(
    @Inject(SANDBOX_RUNNERS)
    private readonly runners: SandboxRunner[],
  ) {}

  private normalizeLanguage(language: string): string {
    return language.trim().toLowerCase();
  }

  async runCode(
    language: string,
    sourceCode: string,
  ): Promise<SandboxExecutionResult> {
    const normalizedLanguage = this.normalizeLanguage(language);
    const runner = this.runners.find((candidate) =>
      candidate.supports(normalizedLanguage),
    );

    if (!runner) {
      throw new Error(
        `No sandbox runner available for language: ${normalizedLanguage}`,
      );
    }

    return runner.run(sourceCode);
  }
}
