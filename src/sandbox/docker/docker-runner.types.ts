import { SandboxExecutionResult } from '../sandbox.types';

export interface DockerRunRequest {
  image: string;
  command: string[];
  tempDir: string;
  timeoutMs: number;
  memory: string;
  memorySwap: string;
  cpus: number;
  pidsLimit: number;
}

export interface DockerRunResult extends SandboxExecutionResult {
  timedOut: boolean;
}
