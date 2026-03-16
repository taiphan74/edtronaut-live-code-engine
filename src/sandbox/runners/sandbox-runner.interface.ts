import { SandboxExecutionResult } from '../sandbox.types';

export interface SandboxRunner {
  supports(language: string): boolean;
  run(sourceCode: string): Promise<SandboxExecutionResult>;
}
