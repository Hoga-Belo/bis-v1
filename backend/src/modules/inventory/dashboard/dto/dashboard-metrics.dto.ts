import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../../entities/inventory/stock-transaction.entity';

export class InventoryOverviewDto {
  @ApiProperty({ description: 'Total number of products' })
  totalProducts: number;

  @ApiProperty({ description: 'Total number of categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Total number of brands' })
  totalBrands: number;

  @ApiProperty({ description: 'Total number of warehouses' })
  totalWarehouses: number;

  @ApiProperty({ description: 'Total stock value (for future use)', required: false })
  totalStockValue?: number;
}

export class StockSummaryDto {
  @ApiProperty({ description: 'Sum of all stock quantities across all warehouses' })
  totalItems: number;

  @ApiProperty({ description: 'Number of products below minimum stock level' })
  lowStockCount: number;

  @ApiProperty({ description: 'Number of products with zero stock' })
  outOfStockCount: number;

  @ApiProperty({ description: 'Number of products with adequate stock (>= minStock)' })
  healthyStockCount: number;
}

export class RecentTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction number' })
  transactionNumber: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  transactionType: TransactionType;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Transaction quantity' })
  quantity: number;

  @ApiProperty({ description: 'Warehouse name' })
  warehouseName: string;

  @ApiProperty({ description: 'Transaction creation date' })
  createdAt: Date;
}

export class WarehouseStockBreakdownDto {
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId: string;

  @ApiProperty({ description: 'Warehouse name' })
  warehouseName: string;

  @ApiProperty({ description: 'Stock quantity in this warehouse' })
  quantity: number;
}

export class LowStockAlertDto {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product SKU' })
  productSku: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Current total stock across all warehouses' })
  currentStock: number;

  @ApiProperty({ description: 'Minimum stock level' })
  minStock: number;

  @ApiProperty({ description: 'Stock deficit (minStock - currentStock)' })
  deficit: number;

  @ApiProperty({
    description: 'Stock breakdown by warehouse',
    type: [WarehouseStockBreakdownDto],
  })
  warehouseBreakdown: WarehouseStockBreakdownDto[];
}

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Inventory overview counts', type: InventoryOverviewDto })
  overview: InventoryOverviewDto;

  @ApiProperty({ description: 'Stock health summary', type: StockSummaryDto })
  stockSummary: StockSummaryDto;

  @ApiProperty({
    description: 'Recent stock transactions',
    type: [RecentTransactionDto],
  })
  recentTransactions: RecentTransactionDto[];

  @ApiProperty({
    description: 'Low stock alerts',
    type: [LowStockAlertDto],
  })
  lowStockAlerts: LowStockAlertDto[];
}

export class StockByCategoryDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Total stock quantity for this category' })
  totalStock: number;

  @ApiProperty({ description: 'Number of products in this category' })
  productCount: number;
}

export class TransactionTrendDto {
  @ApiProperty({ description: 'Date (YYYY-MM-DD format)' })
  date: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  transactionType: TransactionType;

  @ApiProperty({ description: 'Number of transactions' })
  count: number;
}