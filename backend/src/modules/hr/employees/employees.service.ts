
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, MoreThanOrEqual, LessThanOrEqual, And } from 'typeorm';
import {
  Employee,
  EmployeeFamily,
  EmployeeEducation,
  EmployeeDocument,
  Gender as EntityGender,
  EmployeeStatus as EntityEmployeeStatus,
  MaritalStatus as EntityMaritalStatus,
} from '../../../entities/hr';
import { DocumentType } from '../../../entities/hr/employee-document.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
  CreateEmployeeFamilyDto,
  CreateEmployeeEducationDto,
  SortBy,
  SortOrder,
  Gender as DtoGender,
} from './dto';
import { EmployeeStatus as DtoEmployeeStatus } from './dto/update-employee.dto';

// Payroll fields that require special permissions
const PAYROLL_FIELDS = [
  'basicSalary',
  'bankName',
  'bankAccountNumber',
  'bankAccountHolder',
  'taxNumber',
  'bpjsKesehatan',
  'bpjsKetenagakerjaan',
] as const;

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeFamily)
    private readonly familyRepository: Repository<EmployeeFamily>,
    @InjectRepository(EmployeeEducation)
    private readonly educationRepository: Repository<EmployeeEducation>,
    @InjectRepository(EmployeeDocument)
    private readonly documentRepository: Repository<EmployeeDocument>,
  ) {}

  /**
   * Validates that the user has permission to write payroll fields.
   * Throws ForbiddenException if payroll fields are provided without permission.
   */
  private validatePayrollPermission(
    dto: Record<string, unknown>,
    userPermissions: string[],
    requiredPermission: string,
  ): void {
    const providedPayrollFields = PAYROLL_FIELDS.filter(
      (field) => dto[field] !== undefined,
    );

    if (providedPayrollFields.length > 0) {
      const hasPayrollWrite = userPermissions.includes(requiredPermission);
      if (!hasPayrollWrite) {
        throw new ForbiddenException(
          `Payroll fields require ${requiredPermission} permission. Attempted fields: ${providedPayrollFields.join(', ')}`,
        );
      }
    }
  }

  private mapGenderToEntity(gender: DtoGender): EntityGender {
    return gender === DtoGender.L ? EntityGender.MALE : EntityGender.FEMALE;
  }

  private mapEmployeeStatusToEntity(status: DtoEmployeeStatus): EntityEmployeeStatus {
    const statusMap: Record<DtoEmployeeStatus, EntityEmployeeStatus> = {
      [DtoEmployeeStatus.ACTIVE]: EntityEmployeeStatus.ACTIVE,
      [DtoEmployeeStatus.ON_LEAVE]: EntityEmployeeStatus.ON_LEAVE,
      [DtoEmployeeStatus.RESIGNED]: EntityEmployeeStatus.RESIGNED,
      [DtoEmployeeStatus.TERMINATED]: EntityEmployeeStatus.TERMINATED,
    };
    return statusMap[status];
  }

  async findAll(query: EmployeeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      departmentId,
      divisionId,
      positionId,
      employeeStatus,
      gender,
      sortBy = SortBy.NAME,
      sortOrder = SortOrder.ASC,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.division', 'division')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position')
      .leftJoinAndSelect('employee.jobGrade', 'jobGrade')
      .leftJoinAndSelect('employee.employmentStatus', 'employmentStatus')
      .leftJoinAndSelect('employee.workLocation', 'workLocation')
      .leftJoinAndSelect('employee.manager', 'manager')
      .where('employee.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(employee.fullName ILIKE :search OR employee.nik ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (departmentId) {
      queryBuilder.andWhere('employee.departmentId = :departmentId', { departmentId });
    }

    if (divisionId) {
      queryBuilder.andWhere('employee.divisionId = :divisionId', { divisionId });
    }

    if (positionId) {
      queryBuilder.andWhere('employee.positionId = :positionId', { positionId });
    }

    if (employeeStatus) {
      queryBuilder.andWhere('employee.employeeStatus = :employeeStatus', { employeeStatus });
    }

    if (gender) {
      const entityGender = this.mapGenderToEntity(gender);
      queryBuilder.andWhere('employee.gender = :gender', { gender: entityGender });
    }

    const sortField = sortBy || 'fullName';
    queryBuilder.orderBy(`employee.${sortField}`, sortOrder);

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    const mappedData = data.map((employee) => ({
      id: employee.id,
      nik: employee.nik,
      fullName: employee.fullName,
      nickname: employee.nickname,
      gender: employee.gender,
      photoUrl: employee.photoUrl,
      employeeStatus: employee.employeeStatus,
      joinDate: employee.joinDate,
      division: employee.division
        ? { id: employee.division.id, code: employee.division.code, name: employee.division.name }
        : null,
      department: employee.department
        ? { id: employee.department.id, code: employee.department.code, name: employee.department.name }
        : null,
      position: employee.position
        ? { id: employee.position.id, code: employee.position.code, name: employee.position.name }
        : null,
      jobGrade: employee.jobGrade
        ? { id: employee.jobGrade.id, code: employee.jobGrade.code, name: employee.jobGrade.name }
        : null,
      employmentStatus: employee.employmentStatus
        ? { id: employee.employmentStatus.id, code: employee.employmentStatus.code, name: employee.employmentStatus.name }
        : null,
      workLocation: employee.workLocation
        ? { id: employee.workLocation.id, code: employee.workLocation.code, name: employee.workLocation.name }
        : null,
      manager: employee.manager
        ? { id: employee.manager.id, nik: employee.manager.nik, fullName: employee.manager.fullName }
        : null,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }));

    return {
      data: mappedData,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userPermissions: string[] = []) {
    const employee = await this.employeeRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'division',
        'department',
        'position',
        'jobGrade',
        'employmentStatus',
        'workLocation',
        'manager',
        'bloodType',
        'religion',
        'city',
        'city.province',
        'currentCity',
        'currentCity.province',
      ],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const hasPayrollPermission = userPermissions.includes('hr:employee:read:payroll');

    const response: Record<string, unknown> = {
      id: employee.id,
      nik: employee.nik,
      fullName: employee.fullName,
      nickname: employee.nickname,
      idCardNumber: employee.idCardNumber,
      birthPlace: employee.birthPlace,
      birthDate: employee.birthDate,
      gender: employee.gender,
      maritalStatus: employee.maritalStatus,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      photoUrl: employee.photoUrl,
      address: employee.address,
      postalCode: employee.postalCode,
      currentAddress: employee.currentAddress,
      employeeStatus: employee.employeeStatus,
      joinDate: employee.joinDate,
      permanentDate: employee.permanentDate,
      contractStartDate: employee.contractStartDate,
      contractEndDate: employee.contractEndDate,
      resignDate: employee.resignDate,
      resignReason: employee.resignReason,
      annualLeaveBalance: employee.annualLeaveBalance,
      sickLeaveBalance: employee.sickLeaveBalance,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      bloodType: employee.bloodType
        ? { id: employee.bloodType.id, name: employee.bloodType.name }
        : null,
      religion: employee.religion
        ? { id: employee.religion.id, name: employee.religion.name }
        : null,
      city: employee.city
        ? {
            id: employee.city.id,
            name: employee.city.name,
            province: employee.city.province
              ? { id: employee.city.province.id, name: employee.city.province.name }
              : null,
          }
        : null,
      currentCity: employee.currentCity
        ? {
            id: employee.currentCity.id,
            name: employee.currentCity.name,
            province: employee.currentCity.province
              ? { id: employee.currentCity.province.id, name: employee.currentCity.province.name }
              : null,
          }
        : null,
      division: employee.division
        ? { id: employee.division.id, code: employee.division.code, name: employee.division.name }
        : null,
      department: employee.department
        ? { id: employee.department.id, code: employee.department.code, name: employee.department.name }
        : null,
      position: employee.position
        ? { id: employee.position.id, code: employee.position.code, name: employee.position.name }
        : null,
      jobGrade: employee.jobGrade
        ? { id: employee.jobGrade.id, code: employee.jobGrade.code, name: employee.jobGrade.name }
        : null,
      employmentStatus: employee.employmentStatus
        ? { id: employee.employmentStatus.id, code: employee.employmentStatus.code, name: employee.employmentStatus.name }
        : null,
      workLocation: employee.workLocation
        ? { id: employee.workLocation.id, code: employee.workLocation.code, name: employee.workLocation.name }
        : null,
      manager: employee.manager
        ? { id: employee.manager.id, nik: employee.manager.nik, fullName: employee.manager.fullName }
        : null,
    };

    if (hasPayrollPermission) {
      response.basicSalary = employee.basicSalary;
      response.bankName = employee.bankName;
      response.bankAccountNumber = employee.bankAccountNumber;
      response.bankAccountHolder = employee.bankAccountHolder;
      response.taxNumber = employee.taxNumber;
      response.bpjsKesehatan = employee.bpjsKesehatan;
      response.bpjsKetenagakerjaan = employee.bpjsKetenagakerjaan;
    }

    return response;
  }

  async create(dto: CreateEmployeeDto, createdBy?: string, userPermissions: string[] = []) {
    // Validate payroll permission before processing
    this.validatePayrollPermission(
      dto as unknown as Record<string, unknown>,
      userPermissions,
      'hr:employee:create:payroll',
    );

    const existingByNik = await this.employeeRepository.findOne({
      where: { nik: dto.nik, deletedAt: IsNull() },
    });
    if (existingByNik) {
      throw new ConflictException(`Employee with NIK ${dto.nik} already exists`);
    }

    const existingByIdCard = await this.employeeRepository.findOne({
      where: { idCardNumber: dto.idCardNumber, deletedAt: IsNull() },
    });
    if (existingByIdCard) {
      throw new ConflictException(`Employee with ID Card Number ${dto.idCardNumber} already exists`);
    }

    const employeeData: Partial<Employee> = {
      nik: dto.nik,
      fullName: dto.fullName,
      nickname: dto.nickname || null,
      idCardNumber: dto.idCardNumber,
      birthPlace: dto.birthPlace,
      birthDate: new Date(dto.birthDate),
      gender: this.mapGenderToEntity(dto.gender),
      bloodTypeId: dto.bloodTypeId || null,
      religionId: dto.religionId || null,
      maritalStatus: dto.maritalStatus as unknown as EntityMaritalStatus,
      phoneNumber: dto.phoneNumber || null,
      email: dto.email || null,
      address: dto.address || null,
      cityId: dto.cityId || null,
      postalCode: dto.postalCode || null,
      currentAddress: dto.currentAddress || null,
      currentCityId: dto.currentCityId || null,
      divisionId: dto.divisionId || null,
      departmentId: dto.departmentId || null,
      positionId: dto.positionId || null,
      jobGradeId: dto.jobGradeId || null,
      employmentStatusId: dto.employmentStatusId || null,
      workLocationId: dto.workLocationId || null,
      managerId: dto.managerId || null,
      joinDate: dto.joinDate ? new Date(dto.joinDate) : null,
      permanentDate: dto.permanentDate ? new Date(dto.permanentDate) : null,
      contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : null,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : null,
      basicSalary: dto.basicSalary || null,
      bankName: dto.bankName || null,
      bankAccountNumber: dto.bankAccountNumber || null,
      bankAccountHolder: dto.bankAccountHolder || null,
      taxNumber: dto.taxNumber || null,
      bpjsKesehatan: dto.bpjsKesehatan || null,
      bpjsKetenagakerjaan: dto.bpjsKetenagakerjaan || null,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    };

    const employee = this.employeeRepository.create(employeeData);
    const savedEmployee = await this.employeeRepository.save(employee);
    return this.findOne(savedEmployee.id);
  }

  async update(id: string, dto: UpdateEmployeeDto, updatedBy?: string, userPermissions: string[] = []) {
    // Validate payroll permission before processing
    this.validatePayrollPermission(
      dto as unknown as Record<string, unknown>,
      userPermissions,
      'hr:employee:update:payroll',
    );

    const employee = await this.employeeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (dto.nik && dto.nik !== employee.nik) {
      const existingByNik = await this.employeeRepository.findOne({
        where: { nik: dto.nik, deletedAt: IsNull() },
      });
      if (existingByNik) {
        throw new ConflictException(`Employee with NIK ${dto.nik} already exists`);
      }
    }

    if (dto.idCardNumber && dto.idCardNumber !== employee.idCardNumber) {
      const existingByIdCard = await this.employeeRepository.findOne({
        where: { idCardNumber: dto.idCardNumber, deletedAt: IsNull() },
      });
      if (existingByIdCard) {
        throw new ConflictException(`Employee with ID Card Number ${dto.idCardNumber} already exists`);
      }
    }

    if (dto.managerId && dto.managerId === id) {
      throw new BadRequestException('Employee cannot be their own manager');
    }

    if (dto.nik !== undefined) employee.nik = dto.nik;
    if (dto.fullName !== undefined) employee.fullName = dto.fullName;
    if (dto.nickname !== undefined) employee.nickname = dto.nickname || null;
    if (dto.idCardNumber !== undefined) employee.idCardNumber = dto.idCardNumber;
    if (dto.birthPlace !== undefined) employee.birthPlace = dto.birthPlace;
    if (dto.birthDate !== undefined) employee.birthDate = new Date(dto.birthDate);
    if (dto.gender !== undefined) employee.gender = this.mapGenderToEntity(dto.gender);
    if (dto.bloodTypeId !== undefined) employee.bloodTypeId = dto.bloodTypeId || null;
    if (dto.religionId !== undefined) employee.religionId = dto.religionId || null;
    if (dto.maritalStatus !== undefined) employee.maritalStatus = dto.maritalStatus as unknown as EntityMaritalStatus;
    if (dto.phoneNumber !== undefined) employee.phoneNumber = dto.phoneNumber || null;
    if (dto.email !== undefined) employee.email = dto.email || null;
    if (dto.address !== undefined) employee.address = dto.address || null;
    if (dto.cityId !== undefined) employee.cityId = dto.cityId || null;
    if (dto.postalCode !== undefined) employee.postalCode = dto.postalCode || null;
    if (dto.currentAddress !== undefined) employee.currentAddress = dto.currentAddress || null;
    if (dto.currentCityId !== undefined) employee.currentCityId = dto.currentCityId || null;
    if (dto.divisionId !== undefined) employee.divisionId = dto.divisionId || null;
    if (dto.departmentId !== undefined) employee.departmentId = dto.departmentId || null;
    if (dto.positionId !== undefined) employee.positionId = dto.positionId || null;
    if (dto.jobGradeId !== undefined) employee.jobGradeId = dto.jobGradeId || null;
    if (dto.employmentStatusId !== undefined) employee.employmentStatusId = dto.employmentStatusId || null;
    if (dto.workLocationId !== undefined) employee.workLocationId = dto.workLocationId || null;
    if (dto.managerId !== undefined) employee.managerId = dto.managerId || null;
    if (dto.joinDate !== undefined) employee.joinDate = dto.joinDate ? new Date(dto.joinDate) : null;
    if (dto.permanentDate !== undefined) employee.permanentDate = dto.permanentDate ? new Date(dto.permanentDate) : null;
    if (dto.contractStartDate !== undefined) employee.contractStartDate = dto.contractStartDate ? new Date(dto.contractStartDate) : null;
    if (dto.contractEndDate !== undefined) employee.contractEndDate = dto.contractEndDate ? new Date(dto.contractEndDate) : null;
    if (dto.employeeStatus !== undefined) employee.employeeStatus = this.mapEmployeeStatusToEntity(dto.employeeStatus);
    if (dto.resignDate !== undefined) employee.resignDate = dto.resignDate ? new Date(dto.resignDate) : null;
    if (dto.resignReason !== undefined) employee.resignReason = dto.resignReason || null;
    if (dto.basicSalary !== undefined) employee.basicSalary = dto.basicSalary || null;
    if (dto.bankName !== undefined) employee.bankName = dto.bankName || null;
    if (dto.bankAccountNumber !== undefined) employee.bankAccountNumber = dto.bankAccountNumber || null;
    if (dto.bankAccountHolder !== undefined) employee.bankAccountHolder = dto.bankAccountHolder || null;
    if (dto.taxNumber !== undefined) employee.taxNumber = dto.taxNumber || null;
    if (dto.bpjsKesehatan !== undefined) employee.bpjsKesehatan = dto.bpjsKesehatan || null;
    if (dto.bpjsKetenagakerjaan !== undefined) employee.bpjsKetenagakerjaan = dto.bpjsKetenagakerjaan || null;

    employee.updatedBy = updatedBy || null;
    const savedEmployee = await this.employeeRepository.save(employee);
    return this.findOne(savedEmployee.id);
  }

  async remove(id: string, deletedBy?: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const subordinates = await this.employeeRepository.count({
      where: { managerId: id, deletedAt: IsNull() },
    });
    if (subordinates > 0) {
      throw new BadRequestException(
        `Cannot delete employee. They are a manager of ${subordinates} other employee(s). Please reassign their subordinates first.`,
      );
    }

    employee.deletedAt = new Date();
    employee.updatedBy = deletedBy || null;
    await this.employeeRepository.save(employee);
    return { message: 'Employee deleted successfully' };
  }

  async uploadPhoto(id: string, photoUrl: string, updatedBy?: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    employee.photoUrl = photoUrl;
    employee.updatedBy = updatedBy || null;
    await this.employeeRepository.save(employee);
    return { photoUrl };
  }

  async getContractExpiringEmployees(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const employees = await this.employeeRepository.find({
      where: {
        contractEndDate: Between(today, futureDate),
        employeeStatus: EntityEmployeeStatus.ACTIVE,
        deletedAt: IsNull(),
      },
      relations: ['division', 'department', 'position'],
      order: { contractEndDate: 'ASC' },
    });

    return employees.map((e) => ({
      id: e.id,
      nik: e.nik,
      fullName: e.fullName,
      contractEndDate: e.contractEndDate,
      division: e.division ? { id: e.division.id, name: e.division.name } : null,
      department: e.department ? { id: e.department.id, name: e.department.name } : null,
      position: e.position ? { id: e.position.id, name: e.position.name } : null,
    }));
  }

  async getStatistics() {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);

    // Get first day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Get last day of current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Count active employees
    const totalActive = await this.employeeRepository.count({
      where: {
        employeeStatus: EntityEmployeeStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });

    // Count new hires this month (employees with joinDate in current month)
    const newHiresThisMonth = await this.employeeRepository.count({
      where: {
        joinDate: And(
          MoreThanOrEqual(firstDayOfMonth),
          LessThanOrEqual(lastDayOfMonth),
        ),
        deletedAt: IsNull(),
      },
    });

    // Count employees on leave
    const onLeave = await this.employeeRepository.count({
      where: {
        employeeStatus: EntityEmployeeStatus.ON_LEAVE,
        deletedAt: IsNull(),
      },
    });

    // Count employees with contracts expiring in next 30 days
    const contractsExpiringSoon = await this.employeeRepository.count({
      where: {
        contractEndDate: Between(today, futureDate),
        employeeStatus: EntityEmployeeStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });

    return {
      totalActive,
      newHiresThisMonth,
      onLeave,
      contractsExpiringSoon,
    };
  }

  // Family methods
  async getFamilies(employeeId: string) {
    await this.findOne(employeeId);
    return this.familyRepository.find({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['relationshipType', 'educationLevel'],
      order: { createdAt: 'ASC' },
    });
  }

  async addFamily(employeeId: string, dto: CreateEmployeeFamilyDto, createdBy?: string) {
    await this.findOne(employeeId);

    const family = this.familyRepository.create({
      employeeId,
      fullName: dto.fullName,
      relationshipTypeId: dto.relationshipTypeId,
      gender: dto.gender ? this.mapGenderToEntity(dto.gender) : null,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      educationLevelId: dto.educationLevelId || null,
      occupation: dto.occupation || null,
      phoneNumber: dto.phoneNumber || null,
      isEmergencyContact: dto.isEmergencyContact || false,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    return this.familyRepository.save(family);
  }

  async updateFamily(id: string, dto: Partial<CreateEmployeeFamilyDto>, updatedBy?: string) {
    const family = await this.familyRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!family) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    if (dto.fullName !== undefined) family.fullName = dto.fullName;
    if (dto.relationshipTypeId !== undefined) family.relationshipTypeId = dto.relationshipTypeId;
    if (dto.gender !== undefined) family.gender = dto.gender ? this.mapGenderToEntity(dto.gender) : null;
    if (dto.birthDate !== undefined) family.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.educationLevelId !== undefined) family.educationLevelId = dto.educationLevelId || null;
    if (dto.occupation !== undefined) family.occupation = dto.occupation || null;
    if (dto.phoneNumber !== undefined) family.phoneNumber = dto.phoneNumber || null;
    if (dto.isEmergencyContact !== undefined) family.isEmergencyContact = dto.isEmergencyContact;

    family.updatedBy = updatedBy || null;
    return this.familyRepository.save(family);
  }

  async removeFamily(id: string, deletedBy?: string) {
    const family = await this.familyRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!family) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    family.deletedAt = new Date();
    family.updatedBy = deletedBy || null;
    await this.familyRepository.save(family);
    return { message: 'Family member deleted successfully' };
  }

  // Education methods
  async getEducations(employeeId: string) {
    await this.findOne(employeeId);
    return this.educationRepository.find({
      where: { employeeId, deletedAt: IsNull() },
      relations: ['educationLevel'],
      order: { startYear: 'DESC' },
    });
  }

  async addEducation(employeeId: string, dto: CreateEmployeeEducationDto, createdBy?: string) {
    await this.findOne(employeeId);

    const education = this.educationRepository.create({
      employeeId,
      educationLevelId: dto.educationLevelId,
      institutionName: dto.institutionName,
      major: dto.major || null,
      startYear: dto.startYear,
      endYear: dto.endYear || null,
      gpa: dto.gpa || null,
      certificateNumber: dto.certificateNumber || null,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    return this.educationRepository.save(education);
  }

  async updateEducation(id: string, dto: Partial<CreateEmployeeEducationDto>, updatedBy?: string) {
    const education = await this.educationRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!education) {
      throw new NotFoundException(`Education record with ID ${id} not found`);
    }

    if (dto.educationLevelId !== undefined) education.educationLevelId = dto.educationLevelId;
    if (dto.institutionName !== undefined) education.institutionName = dto.institutionName;
    if (dto.major !== undefined) education.major = dto.major || null;
    if (dto.startYear !== undefined) education.startYear = dto.startYear;
    if (dto.endYear !== undefined) education.endYear = dto.endYear || null;
    if (dto.gpa !== undefined) education.gpa = dto.gpa || null;
    if (dto.certificateNumber !== undefined) education.certificateNumber = dto.certificateNumber || null;

    education.updatedBy = updatedBy || null;
    return this.educationRepository.save(education);
  }

  async removeEducation(id: string, deletedBy?: string) {
    const education = await this.educationRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!education) {
      throw new NotFoundException(`Education record with ID ${id} not found`);
    }

    education.deletedAt = new Date();
    education.updatedBy = deletedBy || null;
    await this.educationRepository.save(education);
    return { message: 'Education record deleted successfully' };
  }

  // Document methods
  async getDocuments(employeeId: string) {
    await this.findOne(employeeId);
    return this.documentRepository.find({
      where: { employeeId, deletedAt: IsNull() },
      order: { uploadedAt: 'DESC' },
    });
  }

  async uploadDocument(
    employeeId: string,
    documentType: DocumentType,
    documentName: string,
    fileUrl: string,
    fileSize: number,
    createdBy?: string,
  ) {
    await this.findOne(employeeId);

    const document = this.documentRepository.create({
      employeeId,
      documentType,
      documentName,
      fileUrl,
      fileSize,
      uploadedAt: new Date(),
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    return this.documentRepository.save(document);
  }

  async removeDocument(id: string, deletedBy?: string) {
    const document = await this.documentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    document.deletedAt = new Date();
    document.updatedBy = deletedBy || null;
    await this.documentRepository.save(document);
    return { message: 'Document deleted successfully' };
  }
}