import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaveRequest } from '../../../entities/hr/leave-request.entity';
import { Employee } from '../../../entities/hr/employee.entity';
import { Attendance } from '../../../entities/hr/attendance.entity';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, Employee, Attendance]),
    ScheduleModule.forRoot(),
    ApprovalModule,
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}