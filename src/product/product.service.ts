import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../models/product.model';
import { SubCategory } from '../models/sub-category.model';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { Op, WhereOptions } from 'sequelize';
import { ChangeStateDto } from './dto/change-state.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product) private productRepository: typeof Product,
    @InjectModel(SubCategory) private categoryRepository: typeof SubCategory,
  ) {}

  async create(dto: CreateProductDto, files: string[]) {
    const product = await this.productRepository.create({
      title: dto.title,
      description: dto.description,
      composition: dto.composition,
      vendorCode: dto.vendorCode,
      price: dto.price,
      colors: Array.isArray(dto.colors) ? dto.colors : [dto.colors],
      sizes: Array.isArray(dto.sizes) ? dto.sizes : [dto.sizes],
      recommended: dto.recommended,
      images: files,
      deleted: false,
    });
    await product.$set('subCategories', dto.subCategories);
    return this.productRepository.findOne({
      include: [
        {
          model: SubCategory,
          through: {
            attributes: [],
          },
        },
      ],
      where: {
        id: product.id,
      },
    });
  }

  async edit(dto: EditProductDto, files: string[] | undefined) {
    const [result] = await this.productRepository.update(
      {
        title: dto.title,
        description: dto.description,
        composition: dto.composition,
        vendorCode: dto.vendorCode,
        price: dto.price,
        colors: dto.colors
          ? Array.isArray(dto.colors)
            ? dto.colors
            : [dto.colors]
          : undefined,
        sizes: dto.sizes
          ? Array.isArray(dto.sizes)
            ? dto.sizes
            : [dto.sizes]
          : undefined,
        recommended: dto.recommended,
        images: files,
      },
      {
        where: {
          id: dto.id,
        },
      },
    );
    return { success: result != 0 };
  }

  async getById(id: number) {
    const candidate = await this.productRepository.findOne({
      where: {
        id: id,
      },
      include: [SubCategory],
    });
    if (!candidate)
      throw new BadRequestException({ message: 'Такого обьекта нет' });
    return candidate;
  }

  async search(dto: FilterProductDto) {
    const filter: WhereOptions<Product> = {
      deleted: false,
    };

    if (dto.query) {
      const match = `%${dto.query}%`;
      filter[Op.or] = [
        {
          title: {
            [Op.iLike]: match,
          },
        },
        {
          description: {
            [Op.iLike]: match,
          },
        },
        {
          composition: {
            [Op.iLike]: match,
          },
        },
      ];
    }

    return this.productRepository.findAll({
      where: filter,
      offset: ProductService.pageSize * dto.row,
      limit: ProductService.pageSize,
      include: [
        {
          model: SubCategory,
          where: dto.category
            ? {
                id: dto.category,
              }
            : {},
        },
      ],
    });
  }

  static pageSize = 20;

  async searchCount(dto: FilterProductDto) {
    const filter: WhereOptions<Product> = {
      deleted: false,
    };

    if (dto.query) {
      const match = `%${dto.query}%`;
      filter[Op.or] = [
        {
          title: {
            [Op.iLike]: match,
          },
        },
        {
          description: {
            [Op.iLike]: match,
          },
        },
        {
          composition: {
            [Op.iLike]: match,
          },
        },
      ];
    }

    const count = await this.productRepository.count({
      where: filter,
      include: [
        {
          model: SubCategory,
          where: dto.category
            ? {
                id: dto.category,
              }
            : {},
        },
      ],
    });

    return {
      pages:
        Math.floor(count / ProductService.pageSize) +
        (count % ProductService.pageSize == 0 ? 0 : 1),
    };
  }

  async changeState(dto: ChangeStateDto) {
    const [result] = await this.productRepository.update(
      {
        deleted: dto.state,
      },
      {
        where: {
          id: dto.id,
        },
      },
    );
    return { success: result != 0 };
  }
}
