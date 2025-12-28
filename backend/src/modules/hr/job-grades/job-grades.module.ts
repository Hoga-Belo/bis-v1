import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobGrade, Employee } from '../../../entities/hr';
import { JobGradesController } from './job-grades.controller';
import { JobGradesService } from './job-grades.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobGrade, Employee])],
  controllers: [JobGradesController],
  providers: [JobGradesService],
  exports: [JobGradesService],
})
export class JobGradesModule {}