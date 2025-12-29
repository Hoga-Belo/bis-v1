import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for importing employee data from Excel
 */
export class ImportEmployeeRowDto {
  @ApiProperty({ description: 'NIK Karyawan (16 karakter)', example: '1234567890123456' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  nik: string;

  @ApiProperty({ description: 'Nama Lengkap', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Nama Panggilan', example: 'John' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: 'Nomor KTP (16 karakter)', example: '3201234567890001' })
  @IsString()
  @IsNotEmpty()
  @Length(16, 16)
  idCardNumber: string;

  @ApiProperty({ description: 'Jenis Kelamin (L/P)', example: 'L' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['L', 'P'])
  gender: string;

  @ApiProperty({ description: 'Tempat Lahir', example: 'Jakarta' })
  @IsString()
  @IsNotEmpty()
  birthPlace: string;

  @ApiProperty({ description: 'Tanggal Lahir (YYYY-MM-DD)', example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiPropertyOptional({ description: 'Kode Agama', example: 'ISLAM' })
  @IsString()
  @IsOptional()
  religionCode?: string;

  @ApiPropertyOptional({ description: 'Kode Golongan Darah', example: 'A' })
  @IsString()
  @IsOptional()
  bloodTypeCode?: string;

  @ApiPropertyOptional({
    description: 'Status Pernikahan',
    example: 'SINGLE',
    enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Nomor Telepon', example: '081234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Alamat KTP', example: 'Jl. Sudirman No. 1' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Kode Kota', example: 'JKT' })
  @IsString()
  @IsOptional()
  cityCode?: string;

  @ApiPropertyOptional({ description: 'Kode Pos', example: '12345' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Alamat Domisili', example: 'Jl. Thamrin No. 2' })
  @IsString()
  @IsOptional()
  currentAddress?: string;

  @ApiPropertyOptional({ description: 'Kode Kota Domisili', example: 'JKT' })
  @IsString()
  @IsOptional()
  currentCityCode?: string;

  @ApiPropertyOptional({ description: 'Kode Divisi', example: 'DIV001' })
  @IsString()
  @IsOptional()
  divisionCode?: string;

  @ApiPropertyOptional({ description: 'Kode Departemen', example: 'DEPT001' })
  @IsString()
  @IsOptional()
  departmentCode?: string;

  @ApiPropertyOptional({ description: 'Kode Jabatan', example: 'POS001' })
  @IsString()
  @IsOptional()
  positionCode?: string;

  @ApiPropertyOptional({ description: 'Kode Grade', example: 'GRD001' })
  @IsString()
  @IsOptional()
  jobGradeCode?: string;

  @ApiPropertyOptional({ description: 'Kode Status Karyawan', example: 'PERMANENT' })
  @IsString()
  @IsOptional()
  employmentStatusCode?: string;

  @ApiPropertyOptional({ description: 'Kode Lokasi Kerja', example: 'LOC001' })
  @IsString()
  @IsOptional()
  workLocationCode?: string;

  @ApiPropertyOptional({ description: 'Tanggal Bergabung (YYYY-MM-DD)', example: '2020-01-01' })
  @IsDateString()
  @IsOptional()
  joinDate?: string;

  @ApiPropertyOptional({ description: 'Tanggal Mulai Kontrak (YYYY-MM-DD)', example: '2020-01-01' })
  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @ApiPropertyOptional({ description: 'Tanggal Akhir Kontrak (YYYY-MM-DD)', example: '2021-12-31' })
  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @ApiPropertyOptional({ description: 'NIK Manager', example: '1234567890123457' })
  @IsString()
  @IsOptional()
  managerNik?: string;

  @ApiPropertyOptional({ description: 'Nama Bank', example: 'BCA' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Nomor Rekening', example: '1234567890' })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Nama Pemilik Rekening', example: 'John Doe' })
  @IsString()
  @IsOptional()
  bankAccountHolder?: string;

  @ApiPropertyOptional({ description: 'NPWP', example: '12.345.678.9-012.345' })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'No BPJS Kesehatan', example: '0001234567890' })
  @IsString()
  @IsOptional()
  bpjsKesehatan?: string;

  @ApiPropertyOptional({ description: 'No BPJS Ketenagakerjaan', example: '0001234567890' })
  @IsString()
  @IsOptional()
  bpjsKetenagakerjaan?: string;
}

/**
 * DTO for importing family data from Excel
 */
export class ImportFamilyRowDto {
  @ApiProperty({ description: 'NIK Karyawan', example: '1234567890123456' })
  @IsString()
  @IsNotEmpty()
  employeeNik: string;

  @ApiProperty({ description: 'Nama Anggota Keluarga', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Kode Hubungan', example: 'SPOUSE' })
  @IsString()
  @IsNotEmpty()
  relationshipTypeCode: string;

  @ApiPropertyOptional({ description: 'Tanggal Lahir (YYYY-MM-DD)', example: '1992-05-20' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Nomor Telepon', example: '081234567891' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Alamat', example: 'Jl. Sudirman No. 1' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Kontak Darurat (Y/N)', example: 'Y' })
  @IsString()
  @IsOptional()
  isEmergencyContact?: string;
}

/**
 * DTO for importing education data from Excel
 */
export class ImportEducationRowDto {
  @ApiProperty({ description: 'NIK Karyawan', example: '1234567890123456' })
  @IsString()
  @IsNotEmpty()
  employeeNik: string;

  @ApiProperty({ description: 'Kode Tingkat Pendidikan', example: 'S1' })
  @IsString()
  @IsNotEmpty()
  educationLevelCode: string;

  @ApiProperty({ description: 'Nama Institusi', example: 'Universitas Indonesia' })
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiPropertyOptional({ description: 'Jurusan', example: 'Teknik Informatika' })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiPropertyOptional({ description: 'Tahun Lulus', example: 2015 })
  @IsNumber()
  @IsOptional()
  @Min(1950)
  @Max(2100)
  graduationYear?: number;

  @ApiPropertyOptional({ description: 'IPK', example: 3.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  gpa?: number;
}

/**
 * DTO for import error details
 */
export class ImportErrorDto {
  @ApiProperty({ description: 'Nomor baris di Excel', example: 2 })
  rowNumber: number;

  @ApiProperty({ description: 'NIK Karyawan', example: '1234567890123456' })
  nik: string;

  @ApiProperty({ description: 'Nama field yang error', example: 'email' })
  field: string;

  @ApiProperty({ description: 'Pesan error', example: 'Format email tidak valid' })
  message: string;

  @ApiPropertyOptional({ description: 'Nilai asli dari Excel', example: 'invalid-email' })
  originalValue?: string;
}

/**
 * DTO for import result
 */
export class ImportResultDto {
  @ApiProperty({ description: 'Total baris yang diproses', example: 100 })
  totalRows: number;

  @ApiProperty({ description: 'Jumlah baris berhasil diimport', example: 95 })
  successCount: number;

  @ApiProperty({ description: 'Jumlah baris gagal', example: 5 })
  errorCount: number;

  @ApiProperty({ description: 'Detail error per baris', type: [ImportErrorDto] })
  errors: ImportErrorDto[];

  @ApiPropertyOptional({ description: 'Path file laporan error', example: 'error-report-123.xlsx' })
  errorReportPath?: string;
}

/**
 * DTO for parsed Excel data
 */
export class ParsedExcelDataDto {
  employees: ImportEmployeeRowDto[];
  families: ImportFamilyRowDto[];
  educations: ImportEducationRowDto[];
}