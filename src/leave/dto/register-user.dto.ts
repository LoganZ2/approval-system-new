import { IsEnum, IsString, MinLength } from 'class-validator';
import { Level } from '../types';

export class RegisterUserDto {
  @IsString()
  @MinLength(1, { message: '名字不能为空' })
  name: string;

  @IsString()
  department: string;

  @IsEnum(Level)
  level: Level;
}
