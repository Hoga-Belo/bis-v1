import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Uom } from '../../../entities/inventory/uom.entity';
import { Product } from '../../../entities/inventory/product.entity';
import { UomsService } from './uoms.service';
import { UomsController } from './uoms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Uom, Product])],
  controllers: [UomsController],
  providers: [UomsService],
  exports: [UomsService],
})
export class UomsModule {}