import { IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { Level } from '../types';

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsString()
  @MinLength(2, { message: 'Department must be at least 2 characters long' })
  department: string;

  @IsEnum(Level)
  level: Level;
}
