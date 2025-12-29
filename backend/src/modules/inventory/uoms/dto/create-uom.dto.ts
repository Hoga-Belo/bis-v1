import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUomDto {
  @ApiProperty({
    description: 'Kode satuan (unik)',
    example: 'PCS',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'Kode satuan wajib diisi' })
  @IsString({ message: 'Kode satuan harus berupa string' })
  @MaxLength(10, { message: 'Kode satuan maksimal 10 karakter' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @ApiProperty({
    description: 'Nama satuan',
    example: 'Pieces',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Nama satuan wajib diisi' })
  @IsString({ message: 'Nama satuan harus berupa string' })
  @MaxLength(50, { message: 'Nama satuan maksimal 50 karakter' })
  @Transform(({ value }) => value?.trim())
  name: string;
}