import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { OrderProduct } from './order-product.model';

export enum OrderStatus {
  payed = 'payed',
  waiting = 'waiting',
  error = 'error',
}

@Table({ tableName: 'order', createdAt: true, updatedAt: false })
export class Order extends Model<Order> {
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fio: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  link: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
  })
  orderStatus: OrderStatus;

  @HasMany(() => OrderProduct, 'orderId')
  orderProducts: OrderProduct[];
}
