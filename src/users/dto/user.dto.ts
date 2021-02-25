import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, PickType } from '@nestjs/mapped-types';

export class UserDto {
  @IsNotEmpty({ message: 'CPF does not must be empty' })
  nin: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsPositive()
  age: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  rg: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_of_birth: Date;
}

export class UpdateUserDto extends PartialType(PickType(UserDto, ['name', 'age'] as const)) {}
