import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from '../models/order.model';
import { OrderProduct } from '../models/order-product.model';
import { Product } from '../models/product.model';
import { CountProduct } from '../models/count-product.model';
import { GlobalJwtModule } from '../global-jwt.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderProduct, Product, CountProduct]),
    GlobalJwtModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
