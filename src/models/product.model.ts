import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { SubCategory } from './sub-category.model';
import { ProductSubCategory } from './product-sub-category.model';

@Table({ tableName: 'product', createdAt: false, updatedAt: false })
export class Product extends Model<Product> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING(4000),
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING(4000),
    allowNull: false,
  })
  composition: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vendorCode: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  colors: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  sizes: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  images: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  recommended: boolean;

  @BelongsToMany(() => SubCategory, () => ProductSubCategory)
  subCategories: SubCategory[];

  @HasMany(() => ProductSubCategory, 'categoryId')
  many: ProductSubCategory[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  deleted: boolean;
}
