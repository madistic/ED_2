import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(WebhookLog.name) private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  async processWebhook(payload: any) {
    const webhook_id = `WEBHOOK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.logger.log(`Processing webhook: ${webhook_id}`);

      // Log webhook payload
      const webhookLog = new this.webhookLogModel({
        webhook_id,
        payload,
        status: 'processed',
      });

      // Extract order info from payload
      const { order_info } = payload;
      if (!order_info) {
        throw new Error('Invalid webhook payload: missing order_info');
      }

      // Find order by collect_id
      const order = await this.orderModel.findOne({
        collect_id: order_info.order_id,
      });

      if (!order) {
        throw new Error(`Order not found for collect_id: ${order_info.order_id}`);
      }

      // Update or create order status
      const orderStatusData = {
        collect_id: order._id,
        order_amount: order_info.order_amount || order.amount,
        transaction_amount: order_info.transaction_amount || order_info.order_amount || order.amount,
        payment_mode: order_info.payment_mode || 'unknown',
        payment_details: order_info.payment_details || '',
        bank_reference: order_info.bank_reference || '',
        payment_message: order_info.payment_message || '',
        status: this.mapStatus(order_info.status),
        error_message: order_info.error_message || '',
        payment_time: order_info.payment_time ? new Date(order_info.payment_time) : new Date(),
      };

      await this.orderStatusModel.findOneAndUpdate(
        { collect_id: order._id },
        orderStatusData,
        { upsert: true, new: true },
      );

      await webhookLog.save();

      this.logger.log(`Webhook processed successfully: ${webhook_id}`);
      
      return {
        success: true,
        message: 'Webhook processed successfully',
        webhook_id,
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${webhook_id}`, error.message);

      // Log failed webhook
      const webhookLog = new this.webhookLogModel({
        webhook_id,
        payload,
        status: 'failed',
        error: error.message,
      });
      await webhookLog.save();

      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
        webhook_id,
      };
    }
  }

  private mapStatus(status: string | number): string {
    if (typeof status === 'number') {
      switch (status) {
        case 1:
          return 'success';
        case 0:
          return 'failed';
        default:
          return 'pending';
      }
    }
    
    // Handle string status
    const statusLower = status?.toLowerCase();
    if (statusLower === 'success' || statusLower === 'completed') {
      return 'success';
    } else if (statusLower === 'failed' || statusLower === 'failure') {
      return 'failed';
    }
    
    return 'pending';
  }
}