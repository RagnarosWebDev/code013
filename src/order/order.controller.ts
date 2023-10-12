import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayResultDto } from './dto/pay-result.dto';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { OrderStatus } from '../models/order.model';
import { AdminGuard } from '../admin.guard';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/createPay')
  async createPay(@Body() data: CreateOrderDto) {
    return this.orderService.createPay(data);
  }

  static correctIps = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25',
    '2a02:5180::/32',
    '185.71.76.0',
    '185.71.77.0',
    '77.75.153.0',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128',
    '2a02:5180',
  ];

  @Post('/info')
  async info(@Body() dto: PayResultDto, @Req() request: Request) {
    const ip = request.headers['x-real-ip'] as string;

    console.log(ip);
    console.log(dto);

    /*if (!OrderController.correctIps.includes(ip)) {
      console.log('wrong ip');
      throw new BadRequestException({
        message: 'нельзя',
      });
    }*/

    return await this.orderService.setStatus(
      dto.object.id,
      dto.event == 'payment.succeeded'
        ? OrderStatus.payed
        : dto.event == 'payment.canceled'
        ? OrderStatus.error
        : OrderStatus.waiting,
    );
  }

  @UseGuards(AdminGuard)
  @Get('/list')
  async list(@Query('row') row: number) {
    return this.orderService.list(row);
  }
}
