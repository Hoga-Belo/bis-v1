import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { WorkLocation } from '../../../entities/hr/work-location.entity';
import { Employee, EmployeeStatus } from '../../../entities/hr/employee.entity';
import { City } from '../../../entities/master-data/city.entity';
import {
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  WorkLocationQueryDto,
} from './dto';

@Injectable()
export class WorkLocationsService {
  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createWorkLocationDto: CreateWorkLocationDto): Promise<WorkLocation> {
    // Check for duplicate code
    const existingWorkLocation = await this.workLocationRepository.findOne({
      where: { code: createWorkLocationDto.code },
      withDeleted: true,
    });

    if (existingWorkLocation) {
      throw new ConflictException(
        `Work location with code ${createWorkLocationDto.code} already exists`,
      );
    }

    // Validate city if provided
    if (createWorkLocationDto.cityId) {
      await this.validateCity(createWorkLocationDto.cityId);
    }

    const workLocation = this.workLocationRepository.create(createWorkLocationDto);
    return this.workLocationRepository.save(workLocation);
  }

  async findAll(query: WorkLocationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.workLocationRepository
      .createQueryBuilder('workLocation')
      .leftJoinAndSelect('workLocation.city', 'city')
      .leftJoinAndSelect('city.province', 'province');

    if (search) {
      queryBuilder.andWhere(
        '(workLocation.code ILIKE :search OR workLocation.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`workLocation.${sortBy}`, sortOrder);

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { id },
      relations: ['city', 'city.province'],
    });

    if (!workLocation) {
      throw new NotFoundException(`Work location with ID ${id} not found`);
    }

    return workLocation;
  }

  async update(
    id: string,
    updateWorkLocationDto: UpdateWorkLocationDto,
  ): Promise<WorkLocation> {
    const workLocation = await this.findOne(id);

    // Check for duplicate code if code is being updated
    if (
      updateWorkLocationDto.code &&
      updateWorkLocationDto.code !== workLocation.code
    ) {
      const existingWorkLocation = await this.workLocationRepository.findOne({
        where: { code: updateWorkLocationDto.code },
        withDeleted: true,
      });

      if (existingWorkLocation) {
        throw new ConflictException(
          `Work location with code ${updateWorkLocationDto.code} already exists`,
        );
      }
    }

    // Validate city if provided
    if (updateWorkLocationDto.cityId) {
      await this.validateCity(updateWorkLocationDto.cityId);
    }

    Object.assign(workLocation, updateWorkLocationDto);
    return this.workLocationRepository.save(workLocation);
  }

  async remove(id: string): Promise<void> {
    // Verify work location exists
    await this.findOne(id);

    // Check if any active employees are assigned to this work location
    const activeEmployeeCount = await this.employeeRepository.count({
      where: {
        workLocationId: id,
        employeeStatus: EmployeeStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete work location. ${activeEmployeeCount} active employee(s) are assigned to this work location.`,
      );
    }

    await this.workLocationRepository.softDelete(id);
  }

  private async validateCity(cityId: string): Promise<void> {
    const city = await this.cityRepository.findOne({
      where: { id: cityId },
    });

    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found`);
    }
  }
}