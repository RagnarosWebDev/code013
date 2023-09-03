import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SubCategory } from '../models/sub-category.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private categoryRepository: typeof Category,
    @InjectModel(SubCategory)
    private categoryTypeRepository: typeof SubCategory,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = await this.categoryRepository.create({
      name: dto.name,
    });
    for (const type of dto.subCategories) {
      await this.categoryTypeRepository.create({
        name: type,
        categoryId: category.id,
      });
    }

    return this.categoryRepository.findOne({
      include: [SubCategory],
    });
  }

  async list() {
    return this.categoryRepository.findAll({
      include: [SubCategory],
      order: ['id'],
    });
  }
}
