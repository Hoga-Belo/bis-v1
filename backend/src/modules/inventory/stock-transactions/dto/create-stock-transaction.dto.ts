import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../../entities/inventory/stock-transaction.entity';

export class CreateStockTransactionDto {
  @ApiProperty({
    description: 'Type of stock transaction',
    enum: TransactionType,
    example: TransactionType.INBOUND,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description:
      'Warehouse ID - Source warehouse for OUTBOUND/TRANSFER, target warehouse for INBOUND',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({
    description: 'Target warehouse ID - Required only for TRANSFER type',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ValidateIf((o) => o.transactionType === TransactionType.TRANSFER)
  @IsNotEmpty({ message: 'Target warehouse is required for TRANSFER transactions' })
  @IsUUID()
  @IsOptional()
  targetWarehouseId?: string;

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