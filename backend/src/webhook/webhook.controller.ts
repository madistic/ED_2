import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() payload: any) {
    const result = await this.webhookService.processWebhook(payload);
    return result;
  }
}