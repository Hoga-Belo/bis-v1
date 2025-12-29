import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, LeaveRequest } from '../../../entities/hr';
import { ApprovalService } from './approval.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, LeaveRequest])],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}