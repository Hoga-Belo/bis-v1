import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkLocation } from '../../../entities/hr/work-location.entity';
import { Employee } from '../../../entities/hr/employee.entity';
import { City } from '../../../entities/master-data/city.entity';
import { WorkLocationsService } from './work-locations.service';
import { WorkLocationsController } from './work-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkLocation, Employee, City])],
  controllers: [WorkLocationsController],
  providers: [WorkLocationsService],
  exports: [WorkLocationsService],
})
export class WorkLocationsModule {}