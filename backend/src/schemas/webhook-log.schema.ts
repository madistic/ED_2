import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ required: true })
  webhook_id: string;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ default: Date.now })
  receivedAt: Date;

  @Prop({ required: true, enum: ['processed', 'failed'] })
  status: string;

  @Prop()
  error: string;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

// Create indexes
WebhookLogSchema.index({ webhook_id: 1 });
WebhookLogSchema.index({ receivedAt: -1 });
WebhookLogSchema.index({ status: 1 });