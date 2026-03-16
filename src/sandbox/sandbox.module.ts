import { JavascriptRunner } from './runners/javascript.runner';
import { TypescriptRunner } from './runners/typescript.runner';
import { Module } from '@nestjs/common';
import { PythonRunner } from './runners/python.runner';
import { SANDBOX_RUNNERS, SandboxService } from './sandbox.service';

@Module({
  providers: [
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
