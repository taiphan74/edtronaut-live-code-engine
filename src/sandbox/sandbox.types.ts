export interface SandboxExecutionResult {
  // Captured standard output from the executed program.
  stdout: string | null;
  // Captured standard error from the executed program.
  stderr: string | null;
  // Process exit code. Zero means success, non-zero means user-code failure.
  exitCode: number | null;
  // Total execution duration reported by the runner in milliseconds.
  executionTimeMs: number | null;
}
