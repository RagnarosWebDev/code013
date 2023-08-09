import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { ProductSubCategory } from './product-sub-category.model';
import { Product } from './product.model';

@Table({ tableName: 'categoryType', createdAt: false, updatedAt: false })
export class SubCategory extends Model<SubCategory> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @BelongsTo(() => Category, 'categoryId')
  category: Category;

  @BelongsToMany(() => Product, () => ProductSubCategory)
  products: Product[];
}
