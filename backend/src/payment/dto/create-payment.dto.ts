import { IsString, IsNotEmpty, IsObject, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsUrl()
  @IsNotEmpty()
  callback_url: string;

  @IsObject()
  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;
}