import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './shared/config/app.config';
import databaseConfig from './shared/config/database.config';
import { validateEnvironment } from './shared/config/environment.validation';
import redisConfig from './shared/config/redis.config';
import { createTypeOrmOptions } from './infrastructure/database/typeorm.config';
import { CodeSessionsModule } from './modules/code-sessions/code-sessions.module';
import { ExecutionsModule } from './modules/executions/executions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, redisConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    CodeSessionsModule,
    ExecutionsModule,
  ],
})
export class AppModule {}
