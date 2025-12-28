import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentStatus, Employee } from '../../../entities/hr';
import { EmploymentStatusesController } from './employment-statuses.controller';
import { EmploymentStatusesService } from './employment-statuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmploymentStatus, Employee])],
  controllers: [EmploymentStatusesController],
  providers: [EmploymentStatusesService],
  exports: [EmploymentStatusesService],
})
export class EmploymentStatusesModule {}