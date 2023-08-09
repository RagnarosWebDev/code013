import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from '../models/category.model';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SubCategory } from '../models/sub-category.model';

@Module({
  imports: [SequelizeModule.forFeature([Category, SubCategory])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
