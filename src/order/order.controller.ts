import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { FreeKassaDto } from './dto/pay-result.dto';
import * as md5 from 'md5';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../models/order.model';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/createPay')
  async createPay(@Body() data: CreateOrderDto) {
    return this.orderService.createPay(data);
  }

  @Post('/info_kassa')
  async freeKassaPay(@Body() dto: FreeKassaDto) {
    if (!dto.SIGN) {
      throw new HttpException('Токен должен быть', HttpStatus.BAD_REQUEST);
    }
    try {
      const res =
        dto.SIGN ==
        md5(`30887:${dto.AMOUNT}:%B6g?rcQ0d=k0r2:${dto.MERCHANT_ORDER_ID}`);
      if (res) {
        return await this.orderService.setStatus(
          dto.MERCHANT_ORDER_ID,
          OrderStatus.payed,
        );
      }
    } catch (e) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }
  }
}

//1072d67c19674807fe52fd2ac2964724
//V)xf4h1DfE3853I
//X{pP9%iY})b2JX@
