import { IsOptional, IsString, IsEnum, IsUUID, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { TransactionType } from '../../../../entities/inventory/stock-transaction.entity';

export class StockTransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by transaction number or reference number',
    example: 'IN/20241229',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.INBOUND,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (inclusive)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (inclusive)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['transactionNumber', 'createdAt', 'quantity', 'transactionDate'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['transactionNumber', 'createdAt', 'quantity', 'transactionDate'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}