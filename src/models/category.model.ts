import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SubCategory } from './sub-category.model';

@Table({ tableName: 'category', createdAt: false, updatedAt: false })
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => SubCategory, 'categoryId')
  categoryTypes: SubCategory[];
}
