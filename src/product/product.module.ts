import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SubCategory } from '../models/sub-category.model';
import { ProductSubCategory } from '../models/product-sub-category.model';
import { CountProduct } from '../models/count-product.model';
import { GlobalJwtModule } from '../global-jwt.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      SubCategory,
      ProductSubCategory,
      CountProduct,
    ]),
    GlobalJwtModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
