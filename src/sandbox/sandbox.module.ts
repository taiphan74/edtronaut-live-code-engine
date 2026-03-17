import { JavascriptRunner } from './runners/javascript.runner';
import { TypescriptRunner } from './runners/typescript.runner';
import { Module } from '@nestjs/common';
import { DockerRunnerService } from './docker/docker-runner.service';
import { PythonRunner } from './runners/python.runner';
import { SANDBOX_RUNNERS, SandboxService } from './sandbox.service';

@Module({
  providers: [
    DockerRunnerService,
    PythonRunner,
    JavascriptRunner,
    TypescriptRunner,
    {
      provide: SANDBOX_RUNNERS,
      inject: [PythonRunner, JavascriptRunner, TypescriptRunner],
      useFactory: (
        pythonRunner: PythonRunner,
        javascriptRunner: JavascriptRunner,
        typescriptRunner: TypescriptRunner,
      ) => [pythonRunner, javascriptRunner, typescriptRunner],
    },
    SandboxService,
  ],
  exports: [SandboxService],
})
export class SandboxModule {}
