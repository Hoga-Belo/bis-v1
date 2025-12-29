import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../../entities/inventory/product.entity';
import { Category } from '../../../entities/inventory/category.entity';
import { Brand } from '../../../entities/inventory/brand.entity';
import { Uom } from '../../../entities/inventory/uom.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { productPhotoUploadConfig } from '../../../config/upload.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Brand, Uom, Stock]),
    MulterModule.register(productPhotoUploadConfig),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}