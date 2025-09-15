import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  async getAllTransactions(@Query() query: TransactionQueryDto) {
    return this.transactionService.getAllTransactions(query);
  }

  @Get('school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionService.getTransactionsBySchool(schoolId, query);
  }
}