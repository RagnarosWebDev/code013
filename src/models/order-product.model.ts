import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from './product.model';

@Table({ tableName: 'orderProduct' })
export class OrderProduct extends Model<OrderProduct> {
  id: number;

  @ForeignKey(() => Order)
  orderId: number;

  @ForeignKey(() => Product)
  productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  count: number;

  @BelongsTo(() => Order, 'orderId')
  order: Order;

  @BelongsTo(() => Product, 'productId')
  product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  size: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  color: string;
}
