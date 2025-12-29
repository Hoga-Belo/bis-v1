import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { WorkLocation } from '../../../entities/hr/work-location.entity';
import { Employee } from '../../../entities/hr/employee.entity';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      Stock,
      Product,
      WorkLocation,
      Employee,
    ]),
  ],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}