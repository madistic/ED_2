import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getAllTransactions(query: TransactionQueryDto) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status, school_id } = query;
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Join with order status
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info',
        },
      },
      {
        $addFields: {
          status_info: { $arrayElemAt: ['$status_info', 0] },
        },
      },
      // Add computed fields
      {
        $addFields: {
          status: {
            $cond: {
              if: { $ne: ['$status_info', null] },
              then: '$status_info.status',
              else: 'pending',
            },
          },
          order_amount: '$amount',
          transaction_amount: {
            $cond: {
              if: { $ne: ['$status_info', null] },
              then: '$status_info.transaction_amount',
              else: '$amount',
            },
          },
          payment_time: {
            $cond: {
              if: { $ne: ['$status_info', null] },
              then: '$status_info.payment_time',
              else: '$createdAt',
            },
          },
        },
      },
    ];

    // Add filters
    const matchConditions: any = {};
    if (status) {
      matchConditions.status = status;
    }
    if (school_id) {
      matchConditions.school_id = school_id;
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting
    const sortField = sort === 'payment_time' ? 'payment_time' : sort;
    pipeline.push({ $sort: { [sortField]: sortOrder } });

    // Count total documents
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.orderModel.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Project final fields
    pipeline.push({
      $project: {
        collect_id: '$collect_id',
        school_id: 1,
        gateway: '$gateway_name',
        order_amount: 1,
        transaction_amount: 1,
        status: 1,
        custom_order_id: 1,
        student_info: 1,
        payment_time: 1,
        createdAt: 1,
        status_details: '$status_info',
      },
    });

    const transactions = await this.orderModel.aggregate(pipeline);

    return {
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionsBySchool(schoolId: string, query: TransactionQueryDto) {
    return this.getAllTransactions({ ...query, school_id: schoolId });
  }
}