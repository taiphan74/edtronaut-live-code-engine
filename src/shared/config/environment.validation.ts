import { plainToInstance } from 'class-transformer';
import {
  ValidationError,
  IsInt,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  DATABASE_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT!: number;

  @IsString()
  DATABASE_USERNAME!: string;

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  DATABASE_NAME!: string;

  @IsString()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT!: number;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formatErrors = (validationErrors: ValidationError[]): string[] =>
      validationErrors.flatMap((validationError) => {
        const constraints = validationError.constraints
          ? Object.values(validationError.constraints).map(
              (message) => `${validationError.property} ${message}`,
            )
          : [];
        const children = validationError.children?.length
          ? formatErrors(validationError.children)
          : [];

        return [...constraints, ...children];
      });

    throw new Error(
      `Environment validation failed: ${formatErrors(errors).join('; ')}`,
    );
  }

  return config;
}
