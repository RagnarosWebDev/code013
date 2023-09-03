import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Order, OrderStatus } from '../models/order.model';
import { Product } from '../models/product.model';
import { Op } from 'sequelize';
import { OrderProduct } from '../models/order-product.model';
import * as md5 from 'md5';
import { CountProduct } from '../models/count-product.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private orderRepository: typeof Order,
    @InjectModel(Product) private productRepository: typeof Product,
    @InjectModel(OrderProduct)
    private orderProductRepository: typeof OrderProduct,
    @InjectModel(CountProduct)
    private countProductRepository: typeof CountProduct,
  ) {}
  async setStatus(payId: string, status: OrderStatus) {
    const candidate = await this.orderRepository.findOne({
      where: {
        paymentId: payId,
      },
    });
    if (!candidate)
      throw new BadRequestException('Такого платежа не существует');
    candidate.set('orderStatus', status);
    candidate.orderStatus = status;
    return candidate;
  }

  randomString(n): string {
    let result = '';
    while (result.length < n) result += Math.random().toString(36).substring(2);
    return result.substring(0, n).toUpperCase();
  }
  async createPay(dto: CreateOrderDto) {
    const retry = [...new Set(dto.products.map((u) => u.productId))];

    const pays = await this.productRepository.findAll({
      where: {
        id: {
          [Op.in]: retry,
        },
      },
      include: [CountProduct],
    });

    if (pays.length != retry.length)
      throw new BadRequestException({
        message: 'Некоторых продуктов не существует',
      });

    const productFail: CountProduct[] = [];
    for (const item of dto.products) {
      const countPay = pays.find((e) => e.id == item.productId);
      const result = countPay.productCounts.find(
        (e) => e.color == item.color && e.size == item.size,
      );

      if (!result)
        throw new BadRequestException({
          message: 'У товара нет такого варианта',
        });

      if (result.count - item.count < 0) {
        productFail.push(result);
      }
    }

    if (productFail.length) {
      throw new BadRequestException({
        message: `Количество товаров меньше чем на складе`,
        products: productFail,
      });
    }

    let generate;
    do {
      generate = this.randomString(6);
    } while (
      await this.orderRepository.findOne({
        where: {
          paymentId: generate,
        },
      })
    );

    const order = await this.orderRepository.create({
      address: dto.address,
      fio: dto.fio,
      email: dto.email,
      phone: dto.phone,
      price: 0,
      link: '',
      paymentId: generate,
      orderStatus: OrderStatus.waiting,
    });

    let price = 0;

    for (const productItem of dto.products) {
      price +=
        pays.filter((u) => u.id == productItem.productId)[0].price *
        productItem.count;
      await this.countProductRepository.decrement(
        {
          count: productItem.count,
        },
        {
          where: {
            productId: productItem.productId,
            size: productItem.size,
            color: productItem.color,
          },
        },
      );
      await this.orderProductRepository.create({
        productId: productItem.productId,
        orderId: order.id,
        size: productItem.size,
        color: productItem.color,
        count: productItem.count,
      });
    }

    const hashed = md5(`38531:${price}:V)xf4h1DfE3853I:RUB:${generate}`);

    const payUrl = `https://pay.freekassa.ru/?oa=${price}&currency=RUB&o=${generate}&s=${hashed}&m=38531`;

    await this.orderRepository.update(
      {
        price: price,
        link: payUrl,
      },
      {
        where: {
          id: order.id,
        },
      },
    );

    return this.orderRepository.findOne({
      where: {
        id: order.id,
      },
    });
  }
}

//1072d67c19674807fe52fd2ac2964724
//V)xf4h1DfE3853I
//X{pP9%iY})b2JX@
