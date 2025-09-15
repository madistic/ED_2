import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    try {
      // Seed admin user
      await this.seedUsers();
      
      // Seed orders and statuses
      await this.seedOrders();
      
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
    }
  }

  async seedUsers() {
    const userCount = await this.userModel.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new this.userModel({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      this.logger.log('Admin user created: admin/admin123');
    }
  }

  async seedOrders() {
    const orderCount = await this.orderModel.countDocuments();
    if (orderCount === 0) {
      const sampleOrders = [
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319509b41c5ba',
          student_info: {
            name: 'John Doe',
            id: 'STU001',
            email: 'john.doe@example.com',
          },
          gateway_name: 'Edviron',
          custom_order_id: 'ORDER_1703001001_abc123',
          collect_id: 'COLLECT_001',
          amount: 1000,
          callback_url: 'https://example.com/callback',
        },
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319509b41c5ba',
          student_info: {
            name: 'Jane Smith',
            id: 'STU002',
            email: 'jane.smith@example.com',
          },
          gateway_name: 'Edviron',
          custom_order_id: 'ORDER_1703001002_def456',
          collect_id: 'COLLECT_002',
          amount: 1500,
          callback_url: 'https://example.com/callback',
        },
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319509b41c5ba',
          student_info: {
            name: 'Alice Johnson',
            id: 'STU003',
            email: 'alice.johnson@example.com',
          },
          gateway_name: 'Edviron',
          custom_order_id: 'ORDER_1703001003_ghi789',
          collect_id: 'COLLECT_003',
          amount: 2000,
          callback_url: 'https://example.com/callback',
        },
        // Add more sample orders...
      ];

      // Create more sample data
      for (let i = 4; i <= 15; i++) {
        sampleOrders.push({
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319509b41c5ba',
          student_info: {
            name: `Student ${i}`,
            id: `STU${i.toString().padStart(3, '0')}`,
            email: `student${i}@example.com`,
          },
          gateway_name: 'Edviron',
          custom_order_id: `ORDER_170300100${i}_${Math.random().toString(36).substr(2, 6)}`,
          collect_id: `COLLECT_${i.toString().padStart(3, '0')}`,
          amount: Math.floor(Math.random() * 5000) + 500,
          callback_url: 'https://example.com/callback',
        });
      }

      const orders = await this.orderModel.insertMany(sampleOrders);

      // Create sample order statuses
      const statuses = ['success', 'pending', 'failed'];
      const paymentModes = ['netbanking', 'upi', 'card', 'wallet'];

      for (const order of orders) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

        const orderStatus = new this.orderStatusModel({
          collect_id: order._id,
          order_amount: order.amount,
          transaction_amount: order.amount,
          payment_mode: paymentMode,
          payment_details: `Payment via ${paymentMode}`,
          bank_reference: `REF_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
          payment_message: status === 'success' ? 'Payment successful' : status === 'failed' ? 'Payment failed' : 'Payment pending',
          status,
          error_message: status === 'failed' ? 'Transaction declined by bank' : '',
          payment_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        });

        await orderStatus.save();
      }

      this.logger.log(`Seeded ${orders.length} orders with statuses`);
    }
  }
}