import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../models/product.model';
import { SubCategory } from '../models/sub-category.model';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { Op, WhereOptions } from 'sequelize';
import { ChangeStateDto } from './dto/change-state.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { GetByIdsDto } from './dto/get-by-ids.dto';
import { SetProductsCountDto } from './dto/set-products-count.dto';
import { CountProduct } from '../models/count-product.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product) private productRepository: typeof Product,
    @InjectModel(SubCategory) private categoryRepository: typeof SubCategory,
    @InjectModel(CountProduct)
    private countProductRepository: typeof CountProduct,
  ) {}

  async getByIds(dto: GetByIdsDto) {
    return this.productRepository.findAll({
      where: {
        id: {
          [Op.in]: dto.ids,
        },
        deleted: false,
      },
      include: [CountProduct],
    });
  }

  async updateProductsCount(dto: SetProductsCountDto) {
    const product = await this.getById(dto.productId);
    if (
      product.productCounts.length == 0 &&
      dto.productsCount.length != product.sizes.length * product.colors.length
    ) {
      throw new BadRequestException({
        message: 'Для первого запроса надо ввести все варианты',
      });
    }

    for (const item of dto.productsCount) {
      const result = product.productCounts.find(
        (e) => e.color == item.color && e.size == item.size,
      );
      if (!result) {
        await this.countProductRepository.create({
          productId: dto.productId,
          color: item.color,
          size: item.size,
          count: item.count,
        });
      } else {
        await this.countProductRepository.increment(
          {
            count: item.count,
          },
          {
            where: {
              id: result.id,
            },
          },
        );
      }
    }

    return this.productRepository.findOne({
      where: {
        id: dto.productId,
      },
      include: [SubCategory, CountProduct],
    });
  }

  async create(dto: CreateProductDto, files: Express.Multer.File[]) {
    const product = await this.productRepository.create({
      title: dto.title,
      description: dto.description,
      composition: dto.composition,
      vendorCode: dto.vendorCode,
      price: dto.price,
      colors: Array.isArray(dto.colors) ? dto.colors : [dto.colors],
      sizes: Array.isArray(dto.sizes) ? dto.sizes : [dto.sizes],
      recommended: dto.recommended,
      modelCharacteristics: dto.modelCharacteristics,
      deleted: false,
    });

    for (const color of dto.colors) {
      for (const size of dto.sizes) {
        await this.countProductRepository.create({
          size: size,
          color: color,
          count: 0,
          productId: product.id,
          images: files
            .filter((e) => e.fieldname == `image-${color}`)
            .map((e) => e.filename),
          cartImage: files.find((e) => e.fieldname == `cart-${color}`).filename,
        });
      }
    }
    await product.$set('subCategories', dto.subCategories);
    return this.productRepository.findOne({
      include: [
        {
          model: SubCategory,
          through: {
            attributes: [],
          },
        },
        {
          model: CountProduct,
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
      include: [SubCategory, CountProduct],
    });
    if (!candidate)
      throw new BadRequestException({ message: 'Такого обьекта нет' });
    return candidate;
  }

  async search(dto: FilterProductDto) {
    const filter: WhereOptions<Product> = {
      deleted: false,
    };

    if (dto.recommended) filter.recommended = dto.recommended;
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
        {
          model: CountProduct,
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
