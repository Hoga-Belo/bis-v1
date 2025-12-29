import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransaction } from '../../../entities/inventory/stock-transaction.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { StockTransactionsService } from './stock-transactions.service';
import { StockTransactionsController } from './stock-transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockTransaction, Stock, Product, Warehouse]),
  ],
  controllers: [StockTransactionsController],
  providers: [StockTransactionsService],
  exports: [StockTransactionsService],
})
export class StockTransactionsModule {}