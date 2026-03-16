import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCodeSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  language!: string;
}
