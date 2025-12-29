import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Kode brand (unik)',
    example: 'BRD001',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Kode brand wajib diisi' })
  @IsString({ message: 'Kode brand harus berupa string' })
  @MaxLength(50, { message: 'Kode brand maksimal 50 karakter' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @ApiProperty({
    description: 'Nama brand',
    example: 'Caterpillar',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Nama brand wajib diisi' })
  @IsString({ message: 'Nama brand harus berupa string' })
  @MaxLength(100, { message: 'Nama brand maksimal 100 karakter' })
  @Transform(({ value }) => value?.trim())
  name: string;
}