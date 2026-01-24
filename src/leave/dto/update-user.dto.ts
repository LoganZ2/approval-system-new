import { IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { Level } from '../types';

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @MinLength(1, { message: '名字不能为空' })
  name: string;

  @IsString()
  department: string;

  @IsEnum(Level)
  level: Level;
}
