import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './models/product.model';
import { ProductSubCategory } from './models/product-sub-category.model';
import { Category } from './models/category.model';
import { SubCategory } from './models/sub-category.model';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OrderModule } from './order/order.module';
import { Order } from './models/order.model';
import { OrderProduct } from './models/order-product.model';
import { CountProduct } from './models/count-product.model';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ProductModule,
    CategoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/images'),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        Product,
        Category,
        SubCategory,
        ProductSubCategory,
        Order,
        OrderProduct,
        CountProduct,
      ],
      //sync: { force: true, alter: false },
      autoLoadModels: true,
    }),
    OrderModule,
    UsersModule,
    JwtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
