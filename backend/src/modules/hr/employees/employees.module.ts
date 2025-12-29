import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Employee,
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
} from '../../../entities/hr';
import {
  Religion,
  BloodType,
  EducationLevel,
  RelationshipType,
  City,
} from '../../../entities/master-data';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { ExcelTemplateService } from './excel-template.service';
import { ExcelImportService } from './excel-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeFamily,
      EmployeeEducation,
      EmployeeDocument,
      Division,
      Department,
      Position,
      JobGrade,
      EmploymentStatus,
      WorkLocation,
      Religion,
      BloodType,
      EducationLevel,
      RelationshipType,
      City,
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, ExcelTemplateService, ExcelImportService],
  exports: [EmployeesService],
})
export class EmployeesModule {}