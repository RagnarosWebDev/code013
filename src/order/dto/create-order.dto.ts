export class CreateOrderDto {
  readonly address: string;
  readonly fio: string;
  readonly phone: string;
  readonly products: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  productId: number;
  count: number;
  size: string;
  color: string;
}
