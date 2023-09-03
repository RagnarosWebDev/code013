import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({
    message: 'Поле адрес не должно быть пустым',
  })
  readonly address: string;

  @IsString({
    message: 'Поле ФИО должно быть строкой',
  })
  @IsNotEmpty({
    message: 'Поле ФИО не должно быть пустым',
  })
  readonly fio: string;

  @IsString({
    message: 'Поле номер телефона должно быть строкой',
  })
  @IsNotEmpty({
    message: 'Поле номер телефона не должно быть пустым',
  })
  @IsPhoneNumber(undefined, {
    message: 'Поле номер телефона должно быть валидно',
  })
  readonly phone: string;

  @IsString({
    message: 'Поле электронная почта должно быть строкой',
  })
  @IsNotEmpty({
    message: 'Поле электронная почта не должно быть пустым',
  })
  @IsEmail(undefined, {
    message: 'Поле email должно быть валидным',
  })
  readonly email: string;

  readonly products: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  productId: number;
  count: number;
  size: string;
  color: string;
}
