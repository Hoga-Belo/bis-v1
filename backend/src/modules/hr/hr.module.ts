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
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
} from '../../entities/hr';
import { DivisionsModule } from './divisions/divisions.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { JobGradesModule } from './job-grades/job-grades.module';
import { EmploymentStatusesModule } from './employment-statuses/employment-statuses.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';
import { OrganizationModule } from './organization/organization.module';
import { EmployeesModule } from './employees/employees.module';

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
      EmployeeFamily,
      EmployeeEducation,
      EmployeeDocument,
    ]),
    DivisionsModule,
    DepartmentsModule,
    PositionsModule,
    JobGradesModule,
    EmploymentStatusesModule,
    WorkLocationsModule,
    OrganizationModule,
    EmployeesModule,
  ],
  exports: [
    DivisionsModule,
    DepartmentsModule,
    PositionsModule,
    JobGradesModule,
    EmploymentStatusesModule,
    WorkLocationsModule,
    OrganizationModule,
    EmployeesModule,
  ],
})
export class HrModule {}