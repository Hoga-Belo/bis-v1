import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { UomsModule } from './uoms/uoms.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { StockTransactionsModule } from './stock-transactions/stock-transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    CategoriesModule,
    BrandsModule,
    UomsModule,
    ProductsModule,
    WarehousesModule,
    StockTransactionsModule,
    DashboardModule,
  ],
  exports: [
    CategoriesModule,
    BrandsModule,
    UomsModule,
    ProductsModule,
    WarehousesModule,
    StockTransactionsModule,
    DashboardModule,
  ],
})
export class InventoryModule {}