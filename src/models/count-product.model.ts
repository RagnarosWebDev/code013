import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from './product.model';

@Table({ tableName: 'count-product', updatedAt: false, createdAt: true })
export class CountProduct extends Model<CountProduct> {
  id: number;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  color: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  size: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  count: number;

  @ForeignKey(() => Product)
  @Column
  productId: number;

  @BelongsTo(() => Product, 'productId')
  product: Product;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  images: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cartImage: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  vendorCode: string;
}
