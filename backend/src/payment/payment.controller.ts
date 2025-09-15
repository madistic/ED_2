import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('transaction-status/:custom_order_id')
  async getTransactionStatus(@Param('custom_order_id') custom_order_id: string) {
    return this.paymentService.getTransactionStatus(custom_order_id);
  }
}