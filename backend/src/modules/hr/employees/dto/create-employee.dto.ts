import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  L = 'L',
  P = 'P',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export class CreateEmployeeDto {
  // Personal Info
  @ApiProperty({ description: 'Employee NIK (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  nik: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: 'ID Card Number (KTP)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  idCardNumber: string;

  @ApiProperty({ description: 'Birth place' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace: string;

  @ApiProperty({ description: 'Birth date' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ enum: Gender, description: 'Gender (L/P)' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ description: 'Blood type ID' })
  @IsOptional()
  @IsUUID()
  bloodTypeId?: string;

  @ApiPropertyOptional({ description: 'Religion ID' })
  @IsOptional()
  @IsUUID()
  religionId?: string;

  @ApiProperty({ enum: MaritalStatus, description: 'Marital status' })
  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  maritalStatus: MaritalStatus;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  // Address
  @ApiPropertyOptional({ description: 'KTP Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City ID for KTP address' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Current address (domicile)' })
  @IsOptional()
  @IsString()
  currentAddress?: string;

  @ApiPropertyOptional({ description: 'City ID for current address' })
  @IsOptional()
  @IsUUID()
  currentCityId?: string;

  // Employment
  @ApiProperty({ description: 'Division ID' })
  @IsUUID()
  @IsNotEmpty()
  divisionId: string;

  @ApiProperty({ description: 'Department ID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Position ID' })
  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @ApiPropertyOptional({ description: 'Job Grade ID' })
  @IsOptional()
  @IsUUID()
  jobGradeId?: string;

  @ApiProperty({ description: 'Employment Status ID' })
  @IsUUID()
  @IsNotEmpty()
  employmentStatusId: string;

  @ApiPropertyOptional({ description: 'Work Location ID' })
  @IsOptional()
  @IsUUID()
  workLocationId?: string;

  @ApiPropertyOptional({ description: 'Manager ID (direct supervisor)' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: 'Join date' })
  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  @ApiPropertyOptional({
    description: 'Permanent date (for contract to permanent)',
  })
  @IsOptional()
  @IsDateString()
  permanentDate?: string;

  @ApiPropertyOptional({ description: 'Contract start date' })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiPropertyOptional({ description: 'Contract end date' })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  // Payroll (optional - requires special permission)
  @ApiPropertyOptional({ description: 'Basic salary' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basicSalary?: number;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank account holder name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountHolder?: string;

  @ApiPropertyOptional({ description: 'Tax number (NPWP)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'BPJS Kesehatan number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bpjsKesehatan?: string;

  @ApiPropertyOptional({ description: 'BPJS Ketenagakerjaan number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bpjsKetenagakerjaan?: string;
}