import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../entities/inventory/product.entity';
import { Category } from '../../../entities/inventory/category.entity';
import { Brand } from '../../../entities/inventory/brand.entity';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { StockTransaction } from '../../../entities/inventory/stock-transaction.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Warehouse,
      Stock,
      StockTransaction,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}