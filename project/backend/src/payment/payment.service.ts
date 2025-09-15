import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    private configService: ConfigService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { amount, callback_url, student_info } = createPaymentDto;
    const school_id = this.configService.get<string>('SCHOOL_ID');
    const pg_key = this.configService.get<string>('PG_KEY');
    const api_key = this.configService.get<string>('API_KEY');
    const payment_api_url = this.configService.get<string>('PAYMENT_API_URL');

    try {
      // Generate custom order ID
      const custom_order_id = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate JWT sign for payment API
      const payload = { school_id, amount, callback_url };
      const sign = jwt.sign(payload, pg_key);

      // Prepare payment request
      const paymentRequest = {
        school_id,
        amount,
        callback_url,
        sign,
        custom_order_id,
        student_info,
      };

      // Call Payment API
      const response = await axios.post(
        `${payment_api_url}/create-collect-request`,
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`,
          },
        },
      );

      if (response.data && response.data.collect_request_id) {
        // Save order to database
        const order = new this.orderModel({
          school_id,
          trustee_id: response.data.trustee_id || 'default_trustee',
          student_info,
          gateway_name: 'Edviron',
          custom_order_id,
          collect_id: response.data.collect_request_id,
          amount: parseFloat(amount),
          callback_url,
        });

        await order.save();

        return {
          success: true,
          message: 'Payment request created successfully',
          collect_request_id: response.data.collect_request_id,
          collect_request_url: response.data.Collect_request_url,
          custom_order_id,
          order_id: order._id,
        };
      } else {
        throw new BadRequestException('Invalid response from payment gateway');
      }
    } catch (error) {
      this.logger.error('Payment creation failed', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Payment creation failed',
      );
    }
  }

  async getTransactionStatus(custom_order_id: string) {
    try {
      // Find order by custom_order_id
      const order = await this.orderModel.findOne({ custom_order_id });
      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const school_id = this.configService.get<string>('SCHOOL_ID');
      const pg_key = this.configService.get<string>('PG_KEY');
      const api_key = this.configService.get<string>('API_KEY');
      const payment_api_url = this.configService.get<string>('PAYMENT_API_URL');

      // Generate JWT sign for status check
      const payload = { school_id, collect_request_id: order.collect_id };
      const sign = jwt.sign(payload, pg_key);

      // Call Payment API for status
      const response = await axios.get(
        `${payment_api_url}/collect-request/${order.collect_id}?school_id=${school_id}&sign=${sign}`,
        {
          headers: {
            'Authorization': `Bearer ${api_key}`,
          },
        },
      );

      // Get order status from our database
      const orderStatus = await this.orderStatusModel.findOne({
        collect_id: order._id,
      });

      return {
        success: true,
        order_info: {
          custom_order_id,
          collect_id: order.collect_id,
          amount: order.amount,
          status: orderStatus?.status || 'pending',
          payment_details: orderStatus || null,
          gateway_response: response.data,
        },
      };
    } catch (error) {
      this.logger.error('Status check failed', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Status check failed',
      );
    }
  }
}