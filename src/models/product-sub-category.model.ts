import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SubCategory } from './sub-category.model';
import { Product } from './product.model';

@Table({ tableName: 'productSubCategory', createdAt: false, updatedAt: false })
export class ProductSubCategory extends Model<ProductSubCategory> {
  @ForeignKey(() => SubCategory)
  @Column
  categoryId: number;

  @ForeignKey(() => Product)
  @Column
  productId: number;
}
