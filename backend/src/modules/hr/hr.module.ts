import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
  Employee,
} from '../../entities/hr';
import { DivisionsModule } from './divisions/divisions.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { JobGradesModule } from './job-grades/job-grades.module';
import { EmploymentStatusesModule } from './employment-statuses/employment-statuses.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Division,
      Department,
      Position,
      JobGrade,
      EmploymentStatus,
      WorkLocation,
      Employee,
    ]),
    DivisionsModule,
    DepartmentsModule,
    PositionsModule,
    JobGradesModule,
    EmploymentStatusesModule,
    WorkLocationsModule,
    OrganizationModule,
    // Future sub-modules will be added here:
    // EmployeesModule,
  ],
  exports: [
    DivisionsModule,
    DepartmentsModule,
    PositionsModule,
    JobGradesModule,
    EmploymentStatusesModule,
    WorkLocationsModule,
    OrganizationModule,
  ],
})
export class HrModule {}