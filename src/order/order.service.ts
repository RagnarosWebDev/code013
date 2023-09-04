import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Order, OrderStatus } from '../models/order.model';
import { Product } from '../models/product.model';
import { Op } from 'sequelize';
import { OrderProduct } from '../models/order-product.model';
import { CountProduct } from '../models/count-product.model';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

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
      include: [OrderProduct],
    });
    console.log(candidate);
    if (!candidate)
      throw new BadRequestException('Такого платежа не существует');
    if (candidate.orderStatus != OrderStatus.waiting)
      throw new BadRequestException('Состояние товара уже выставлено');

    if (status == OrderStatus.error) {
      for (const item of candidate.orderProducts) {
        await this.countProductRepository.increment(
          {
            count: item.count,
          },
          {
            where: {
              productId: item.productId,
              size: item.size,
              color: item.color,
            },
          },
        );
      }
    }

    await this.orderRepository.update(
      {
        orderStatus: status,
      },
      {
        where: {
          paymentId: payId,
        },
      },
    );
    return this.orderRepository.findOne({
      where: {
        paymentId: payId,
      },
      include: [
        {
          model: OrderProduct,
          include: [Product],
        },
      ],
    });
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

    const order = await this.orderRepository.create({
      address: dto.address,
      fio: dto.fio,
      email: dto.email,
      phone: dto.phone,
      price: 0,
      link: '',
      paymentId: '',
      orderStatus: OrderStatus.waiting,
    });

    let price = 0;

    for (const productItem of dto.products) {
      price +=
        pays.filter((u) => u.id == productItem.productId)[0].price *
        productItem.count;
    }

    const {
      id,
      confirmation: { confirmation_url },
    } = await this.createPayFromService(price);

    for (const productItem of dto.products) {
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

    await this.orderRepository.update(
      {
        paymentId: id,
        price: price,
        link: confirmation_url,
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

  async createPayFromService(price: number) {
    try {
      const result = await axios(`https://api.yookassa.ru/v3/payments`, {
        method: 'POST',
        headers: {
          'Idempotence-Key': uuid(),
        },
        auth: {
          username: '250550',
          password: 'test_TP4mu57LGyl4yoMfEhRHF6legMphdh7BnqLbTH6skdI',
        },
        data: {
          amount: {
            value: price,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'https://code013.ru',
          },
        },
      });

      return result.data;
    } catch (e) {
      throw new InternalServerErrorException({
        message: ['Не удалось создать заказ, попробуйте чуть позже'],
      });
    }
  }

  async list(row: number) {
    return this.orderRepository.findAll({
      order: [['id', 'desc']],
      offset: row * 20,
      limit: 20,
      include: [
        {
          model: OrderProduct,
          include: [Product],
        },
      ],
    });
  }
}
