import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}