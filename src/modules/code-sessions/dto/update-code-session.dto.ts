import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCodeSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsString()
  sourceCode?: string;
}
