import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsDate,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Base DTO with common fields for all stock transactions
 */
class BaseStockTransactionDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({
    description: 'Transaction date (defaults to current date if not provided)',
    example: '2024-12-29T10:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  transactionDate?: Date;

  @ApiPropertyOptional({
    description: 'External reference number (e.g., PO number, invoice number)',
    example: 'PO-2024-001',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the transaction',
    example: 'Received from supplier ABC',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for creating an inbound stock transaction
 */
export class CreateInboundDto extends BaseStockTransactionDto {
  @ApiProperty({
    description: 'Quantity to receive (positive number)',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

/**
 * DTO for creating an outbound stock transaction
 */
export class CreateOutboundDto extends BaseStockTransactionDto {
  @ApiProperty({
    description: 'Quantity to issue (positive number)',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

/**
 * DTO for creating a stock adjustment transaction
 * Uses newQuantity to set the absolute stock level (can be 0 or any positive number)
 */
export class CreateAdjustmentDto extends BaseStockTransactionDto {
  @ApiProperty({
    description: 'New stock quantity (target quantity after adjustment)',
    example: 75,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'New quantity cannot be negative' })
  newQuantity: number;

  @ApiProperty({
    description: 'Reason for adjustment (required)',
    example: 'Physical count correction - found discrepancy during inventory audit',
  })
  @IsNotEmpty({ message: 'Notes/reason is required for adjustment transactions' })
  @IsString()
  override notes: string;
}

/**
 * DTO for creating a stock transfer transaction
 */
export class CreateTransferDto extends BaseStockTransactionDto {
  @ApiProperty({
    description: 'Target warehouse ID for the transfer',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsNotEmpty({ message: 'Target warehouse is required for transfer transactions' })
  @IsUUID()
  targetWarehouseId: string;

  @ApiProperty({
    description: 'Quantity to transfer (positive number)',
    example: 25,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

/**
 * Legacy DTO for backward compatibility
 * @deprecated Use specific DTOs (CreateInboundDto, CreateOutboundDto, CreateAdjustmentDto, CreateTransferDto) instead
 */
export class CreateStockTransactionDto extends BaseStockTransactionDto {
  @ApiProperty({
    description: 'Quantity to transact (positive number)',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Target warehouse ID - Required only for TRANSFER type',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  targetWarehouseId?: string;
}