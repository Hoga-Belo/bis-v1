import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Employee, Gender, MaritalStatus } from '../../../entities/hr/employee.entity';
import { EmployeeFamily } from '../../../entities/hr/employee-family.entity';
import { EmployeeEducation } from '../../../entities/hr/employee-education.entity';
import { Division } from '../../../entities/hr/division.entity';
import { Department } from '../../../entities/hr/department.entity';
import { Position } from '../../../entities/hr/position.entity';
import { JobGrade } from '../../../entities/hr/job-grade.entity';
import { EmploymentStatus } from '../../../entities/hr/employment-status.entity';
import { WorkLocation } from '../../../entities/hr/work-location.entity';
import { Religion } from '../../../entities/master-data/religion.entity';
import { BloodType } from '../../../entities/master-data/blood-type.entity';
import { EducationLevel } from '../../../entities/master-data/education-level.entity';
import { RelationshipType } from '../../../entities/master-data/relationship-type.entity';
import { City } from '../../../entities/master-data/city.entity';
import { ImportResultDto, ImportErrorDto } from './dto/import-employee.dto';

interface MasterDataMaps {
  divisions: Map<string, Division>;
  departments: Map<string, Department>;
  positions: Map<string, Position>;
  jobGrades: Map<string, JobGrade>;
  employmentStatuses: Map<string, EmploymentStatus>;
  workLocations: Map<string, WorkLocation>;
  religions: Map<string, Religion>;
  bloodTypes: Map<string, BloodType>;
  educationLevels: Map<string, EducationLevel>;
  relationshipTypes: Map<string, RelationshipType>;
  cities: Map<string, City>;
  existingNiks: Set<string>;
  existingIdCards: Set<string>;
}

interface ParsedEmployee {
  rowNumber: number;
  nik: string;
  fullName: string;
  nickname?: string;
  idCardNumber: string;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  religionId?: string;
  bloodTypeId?: string;
  maritalStatus?: MaritalStatus;
  phoneNumber?: string;
  email?: string;
  address?: string;
  cityId?: string;
  postalCode?: string;
  currentAddress?: string;
  currentCityId?: string;
  divisionId?: string;
  departmentId?: string;
  positionId?: string;
  jobGradeId?: string;
  employmentStatusId?: string;
  workLocationId?: string;
  joinDate?: Date;
  contractStartDate?: Date;
  contractEndDate?: Date;
  managerNik?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolderName?: string;
  npwp?: string;
  bpjsKesehatan?: string;
  bpjsKetenagakerjaan?: string;
}

interface ParsedFamily {
  rowNumber: number;
  employeeNik: string;
  name: string;
  relationshipTypeId: string;
  birthDate?: Date;
  phoneNumber?: string;
  address?: string;
  isEmergencyContact: boolean;
}

interface ParsedEducation {
  rowNumber: number;
  employeeNik: string;
  educationLevelId: string;
  institutionName: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
}

@Injectable()
export class ExcelImportService {
  constructor(
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeFamily) private employeeFamilyRepository: Repository<EmployeeFamily>,
    @InjectRepository(EmployeeEducation) private employeeEducationRepository: Repository<EmployeeEducation>,
    @InjectRepository(Division) private divisionRepository: Repository<Division>,
    @InjectRepository(Department) private departmentRepository: Repository<Department>,
    @InjectRepository(Position) private positionRepository: Repository<Position>,
    @InjectRepository(JobGrade) private jobGradeRepository: Repository<JobGrade>,
    @InjectRepository(EmploymentStatus) private employmentStatusRepository: Repository<EmploymentStatus>,
    @InjectRepository(WorkLocation) private workLocationRepository: Repository<WorkLocation>,
    @InjectRepository(Religion) private religionRepository: Repository<Religion>,
    @InjectRepository(BloodType) private bloodTypeRepository: Repository<BloodType>,
    @InjectRepository(EducationLevel) private educationLevelRepository: Repository<EducationLevel>,
    @InjectRepository(RelationshipType) private relationshipTypeRepository: Repository<RelationshipType>,
    @InjectRepository(City) private cityRepository: Repository<City>,
    private dataSource: DataSource,
  ) {}

  async importFromExcel(file: Express.Multer.File, userId: string): Promise<ImportResultDto> {
    if (!file) throw new BadRequestException('No file uploaded');

    const errors: ImportErrorDto[] = [];
    const masterDataMaps = await this.loadMasterData();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    const employeeSheet = workbook.getWorksheet('KARYAWAN_HEAD');
    const familySheet = workbook.getWorksheet('KELUARGA_DETAIL');
    const educationSheet = workbook.getWorksheet('PENDIDIKAN_DETAIL');

    if (!employeeSheet) {
      this.cleanupFile(file.path);
      throw new BadRequestException('Sheet KARYAWAN_HEAD tidak ditemukan');
    }

    const parsedEmployees = this.parseEmployeeSheet(employeeSheet, masterDataMaps, errors);
    const parsedEmployeeNiks = new Set(parsedEmployees.map((emp: ParsedEmployee) => emp.nik));
    const parsedFamilies = familySheet ? this.parseFamilySheet(familySheet, masterDataMaps, parsedEmployeeNiks, errors) : [];
    const parsedEducations = educationSheet ? this.parseEducationSheet(educationSheet, masterDataMaps, parsedEmployeeNiks, errors) : [];

    const validEmployees = parsedEmployees.filter(
      (emp: ParsedEmployee) => !errors.some((err) => err.rowNumber === emp.rowNumber && err.nik === emp.nik),
    );

    let employeeSuccessCount = 0;
    let familySuccessCount = 0;
    let educationSuccessCount = 0;
    let errorReportPath: string | undefined;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employeeNikToIdMap = new Map<string, string>();

      // Insert new employees
      for (const emp of validEmployees) {
        const employee = queryRunner.manager.create(Employee, {
          nik: emp.nik, fullName: emp.fullName, nickname: emp.nickname, idCardNumber: emp.idCardNumber,
          gender: emp.gender, birthPlace: emp.birthPlace, birthDate: emp.birthDate,
          religionId: emp.religionId, bloodTypeId: emp.bloodTypeId, maritalStatus: emp.maritalStatus,
          phoneNumber: emp.phoneNumber, email: emp.email, address: emp.address, cityId: emp.cityId,
          postalCode: emp.postalCode, currentAddress: emp.currentAddress, currentCityId: emp.currentCityId,
          divisionId: emp.divisionId, departmentId: emp.departmentId, positionId: emp.positionId,
          jobGradeId: emp.jobGradeId, employmentStatusId: emp.employmentStatusId, workLocationId: emp.workLocationId,
          joinDate: emp.joinDate, contractStartDate: emp.contractStartDate, contractEndDate: emp.contractEndDate,
          bankName: emp.bankName, bankAccountNumber: emp.bankAccountNumber, bankAccountHolderName: emp.bankAccountHolderName,
          npwp: emp.npwp, bpjsKesehatan: emp.bpjsKesehatan, bpjsKetenagakerjaan: emp.bpjsKetenagakerjaan,
          createdBy: userId, updatedBy: userId,
        });
        const savedEmployee = await queryRunner.manager.save(employee);
        employeeNikToIdMap.set(emp.nik, savedEmployee.id);
        employeeSuccessCount++;
      }

      // Update manager references for new employees
      for (const emp of validEmployees) {
        if (emp.managerNik) {
          const managerId = employeeNikToIdMap.get(emp.managerNik);
          const employeeId = employeeNikToIdMap.get(emp.nik);
          if (managerId && employeeId) {
            await queryRunner.manager.update(Employee, employeeId, { managerId });
          } else if (employeeId) {
            const existingManager = await queryRunner.manager.findOne(Employee, { where: { nik: emp.managerNik, deletedAt: IsNull() } });
            if (existingManager) await queryRunner.manager.update(Employee, employeeId, { managerId: existingManager.id });
          }
        }
      }

      // Insert family records - support both new and existing employees
      for (const family of parsedFamilies) {
        // First try to get from new employees map
        let employeeId = employeeNikToIdMap.get(family.employeeNik);
        
        // If not found, lookup existing employee in database
        if (!employeeId) {
          const existingEmployee = await queryRunner.manager.findOne(Employee, {
            where: { nik: family.employeeNik, deletedAt: IsNull() },
          });
          employeeId = existingEmployee?.id;
        }
        
        // If employee found, create family record
        if (employeeId) {
          const familyRecord = queryRunner.manager.create(EmployeeFamily, {
            employeeId, name: family.name, relationshipTypeId: family.relationshipTypeId,
            birthDate: family.birthDate, phoneNumber: family.phoneNumber, address: family.address,
            isEmergencyContact: family.isEmergencyContact, createdBy: userId, updatedBy: userId,
          });
          await queryRunner.manager.save(familyRecord);
          familySuccessCount++;
        } else {
          // Employee not found - push error
          errors.push({
            rowNumber: family.rowNumber,
            nik: family.employeeNik,
            field: 'employeeNik',
            message: 'Karyawan tidak ditemukan atau sudah dihapus',
            originalValue: family.employeeNik,
          });
        }
      }

      // Insert education records - support both new and existing employees
      for (const education of parsedEducations) {
        // First try to get from new employees map
        let employeeId = employeeNikToIdMap.get(education.employeeNik);
        
        // If not found, lookup existing employee in database
        if (!employeeId) {
          const existingEmployee = await queryRunner.manager.findOne(Employee, {
            where: { nik: education.employeeNik, deletedAt: IsNull() },
          });
          employeeId = existingEmployee?.id;
        }
        
        // If employee found, create education record
        if (employeeId) {
          const educationRecord = queryRunner.manager.create(EmployeeEducation, {
            employeeId, educationLevelId: education.educationLevelId, institutionName: education.institutionName,
            major: education.major, graduationYear: education.graduationYear, gpa: education.gpa,
            createdBy: userId, updatedBy: userId,
          });
          await queryRunner.manager.save(educationRecord);
          educationSuccessCount++;
        } else {
          // Employee not found - push error
          errors.push({
            rowNumber: education.rowNumber,
            nik: education.employeeNik,
            field: 'employeeNik',
            message: 'Karyawan tidak ditemukan atau sudah dihapus',
            originalValue: education.employeeNik,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Import gagal: ${(error as Error).message}`);
    } finally {
      await queryRunner.release();
    }

    const successCount = employeeSuccessCount + familySuccessCount + educationSuccessCount;

    if (errors.length > 0) errorReportPath = await this.generateErrorReport(errors);
    this.cleanupFile(file.path);

    return { totalRows: parsedEmployees.length, successCount, errorCount: errors.length, errors: errors.slice(0, 100), errorReportPath };
  }
  private async loadMasterData(): Promise<MasterDataMaps> {
    const [divisions, departments, positions, jobGrades, employmentStatuses, workLocations, religions, bloodTypes, educationLevels, relationshipTypes, cities, existingEmployees] = await Promise.all([
      this.divisionRepository.find({ where: { deletedAt: IsNull() } }),
      this.departmentRepository.find({ where: { deletedAt: IsNull() } }),
      this.positionRepository.find({ where: { deletedAt: IsNull() } }),
      this.jobGradeRepository.find({ where: { deletedAt: IsNull() } }),
      this.employmentStatusRepository.find({ where: { deletedAt: IsNull() } }),
      this.workLocationRepository.find({ where: { deletedAt: IsNull() } }),
      this.religionRepository.find({ where: { deletedAt: IsNull() } }),
      this.bloodTypeRepository.find({ where: { deletedAt: IsNull() } }),
      this.educationLevelRepository.find({ where: { deletedAt: IsNull() } }),
      this.relationshipTypeRepository.find({ where: { deletedAt: IsNull() } }),
      this.cityRepository.find({ where: { deletedAt: IsNull() } }),
      this.employeeRepository.find({ where: { deletedAt: IsNull() }, select: ['nik', 'idCardNumber'] }),
    ]);

    return {
      divisions: new Map(divisions.map((d) => [d.code, d])),
      departments: new Map(departments.map((d) => [d.code, d])),
      positions: new Map(positions.map((p) => [p.code, p])),
      jobGrades: new Map(jobGrades.map((j) => [j.code, j])),
      employmentStatuses: new Map(employmentStatuses.map((e) => [e.code, e])),
      workLocations: new Map(workLocations.map((w) => [w.code, w])),
      religions: new Map(religions.map((r) => [r.code, r])),
      bloodTypes: new Map(bloodTypes.map((b) => [b.code, b])),
      educationLevels: new Map(educationLevels.map((e) => [e.code, e])),
      relationshipTypes: new Map(relationshipTypes.map((r) => [r.code, r])),
      cities: new Map(cities.map((c) => [c.code, c])),
      existingNiks: new Set(existingEmployees.map((e) => e.nik)),
      existingIdCards: new Set(existingEmployees.map((e) => e.idCardNumber)),
    };
  }

  private getCellValue(cell: ExcelJS.Cell): string | undefined {
    if (cell.value === null || cell.value === undefined) return undefined;
    if (typeof cell.value === 'object' && 'text' in cell.value) return String(cell.value.text);
    if (typeof cell.value === 'object' && 'result' in cell.value) return String(cell.value.result);
    return String(cell.value).trim() || undefined;
  }

  private parseDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private cleanupFile(filePath: string): void {
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch { /* ignore */ }
  }

  private async generateErrorReport(errors: ImportErrorDto[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Errors');
    sheet.columns = [
      { header: 'Baris', key: 'rowNumber', width: 10 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Pesan Error', key: 'message', width: 50 },
      { header: 'Nilai Asli', key: 'originalValue', width: 30 },
    ];
    sheet.getRow(1).font = { bold: true };
    errors.forEach((error) => sheet.addRow(error));
    const filename = `error_report_${uuidv4()}.xlsx`;
    const filePath = path.join(process.cwd(), 'uploads', 'temp', filename);
    await workbook.xlsx.writeFile(filePath);
    return filename;
  }
  // BUG FIX 1: Correct column indexes to match template
  // BUG FIX 2: Accept L/P gender codes from template
  private parseEmployeeSheet(
    sheet: ExcelJS.Worksheet,
    masterData: MasterDataMaps,
    errors: ImportErrorDto[],
  ): ParsedEmployee[] {
    const employees: ParsedEmployee[] = [];
    const seenNiks = new Set<string>();
    const seenIdCards = new Set<string>();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      // BUG FIX 1: Correct column indexes matching the template
      // Column 1: NIK, Column 2: Full Name, Column 3: Nickname, etc.
      const nik = this.getCellValue(row.getCell(1));
      const fullName = this.getCellValue(row.getCell(2));
      const nickname = this.getCellValue(row.getCell(3));
      const idCardNumber = this.getCellValue(row.getCell(4));
      const genderValue = this.getCellValue(row.getCell(5));
      const birthPlace = this.getCellValue(row.getCell(6));
      const birthDateValue = this.getCellValue(row.getCell(7));
      const religionCode = this.getCellValue(row.getCell(8));
      const bloodTypeCode = this.getCellValue(row.getCell(9));
      const maritalStatusValue = this.getCellValue(row.getCell(10));
      const phoneNumber = this.getCellValue(row.getCell(11));
      const email = this.getCellValue(row.getCell(12));
      const address = this.getCellValue(row.getCell(13));
      const cityCode = this.getCellValue(row.getCell(14));
      const postalCode = this.getCellValue(row.getCell(15));
      const currentAddress = this.getCellValue(row.getCell(16));
      const currentCityCode = this.getCellValue(row.getCell(17));
      const divisionCode = this.getCellValue(row.getCell(18));
      const departmentCode = this.getCellValue(row.getCell(19));
      const positionCode = this.getCellValue(row.getCell(20));
      const jobGradeCode = this.getCellValue(row.getCell(21));
      const employmentStatusCode = this.getCellValue(row.getCell(22));
      const workLocationCode = this.getCellValue(row.getCell(23));
      const joinDateValue = this.getCellValue(row.getCell(24));
      const contractStartDateValue = this.getCellValue(row.getCell(25));
      const contractEndDateValue = this.getCellValue(row.getCell(26));
      const managerNik = this.getCellValue(row.getCell(27));
      const bankName = this.getCellValue(row.getCell(28));
      const bankAccountNumber = this.getCellValue(row.getCell(29));
      const bankAccountHolderName = this.getCellValue(row.getCell(30));
      const npwp = this.getCellValue(row.getCell(31));
      const bpjsKesehatan = this.getCellValue(row.getCell(32));
      const bpjsKetenagakerjaan = this.getCellValue(row.getCell(33));

      // Skip empty rows
      if (!nik && !fullName) return;

      // Validate required fields
      if (!nik) {
        errors.push({ rowNumber, nik: '', field: 'nik', message: 'NIK wajib diisi', originalValue: '' });
        return;
      }
      if (!fullName) {
        errors.push({ rowNumber, nik, field: 'fullName', message: 'Nama lengkap wajib diisi', originalValue: '' });
        return;
      }
      if (!idCardNumber) {
        errors.push({ rowNumber, nik, field: 'idCardNumber', message: 'Nomor KTP wajib diisi', originalValue: '' });
        return;
      }
      if (!genderValue) {
        errors.push({ rowNumber, nik, field: 'gender', message: 'Jenis kelamin wajib diisi', originalValue: '' });
        return;
      }
      if (!birthPlace) {
        errors.push({ rowNumber, nik, field: 'birthPlace', message: 'Tempat lahir wajib diisi', originalValue: '' });
        return;
      }
      if (!birthDateValue) {
        errors.push({ rowNumber, nik, field: 'birthDate', message: 'Tanggal lahir wajib diisi', originalValue: '' });
        return;
      }

      // Check for duplicate NIK in current batch
      if (seenNiks.has(nik)) {
        errors.push({ rowNumber, nik, field: 'nik', message: 'NIK duplikat dalam file import', originalValue: nik });
        return;
      }
      seenNiks.add(nik);

      // Check for duplicate NIK in database
      if (masterData.existingNiks.has(nik)) {
        errors.push({ rowNumber, nik, field: 'nik', message: 'NIK sudah terdaftar di database', originalValue: nik });
        return;
      }

      // Check for duplicate ID card in current batch
      if (seenIdCards.has(idCardNumber)) {
        errors.push({ rowNumber, nik, field: 'idCardNumber', message: 'Nomor KTP duplikat dalam file import', originalValue: idCardNumber });
        return;
      }
      seenIdCards.add(idCardNumber);

      // Check for duplicate ID card in database
      if (masterData.existingIdCards.has(idCardNumber)) {
        errors.push({ rowNumber, nik, field: 'idCardNumber', message: 'Nomor KTP sudah terdaftar di database', originalValue: idCardNumber });
        return;
      }

      // BUG FIX 2: Parse gender - accept L/P codes from template
      let gender: Gender | undefined;
      if (genderValue) {
        const genderUpper = genderValue.toUpperCase();
        if (genderUpper === 'L' || genderUpper === 'LAKI-LAKI' || genderUpper === 'MALE') {
          gender = Gender.MALE;
        } else if (genderUpper === 'P' || genderUpper === 'PEREMPUAN' || genderUpper === 'FEMALE') {
          gender = Gender.FEMALE;
        } else {
          errors.push({ rowNumber, nik, field: 'gender', message: 'Jenis kelamin tidak valid. Gunakan L/P atau Laki-laki/Perempuan', originalValue: genderValue });
          return;
        }
      }

      // Parse birth date
      const birthDate = this.parseDate(birthDateValue);
      if (!birthDate) {
        errors.push({ rowNumber, nik, field: 'birthDate', message: 'Format tanggal lahir tidak valid', originalValue: birthDateValue || '' });
        return;
      }

      // Validate religion
      let religionId: string | undefined;
      if (religionCode) {
        const religion = masterData.religions.get(religionCode);
        if (!religion) {
          errors.push({ rowNumber, nik, field: 'religion', message: `Kode agama tidak ditemukan: ${religionCode}`, originalValue: religionCode });
          return;
        }
        religionId = religion.id;
      }

      // Validate blood type
      let bloodTypeId: string | undefined;
      if (bloodTypeCode) {
        const bloodType = masterData.bloodTypes.get(bloodTypeCode);
        if (!bloodType) {
          errors.push({ rowNumber, nik, field: 'bloodType', message: `Kode golongan darah tidak ditemukan: ${bloodTypeCode}`, originalValue: bloodTypeCode });
          return;
        }
        bloodTypeId = bloodType.id;
      }

      // Parse marital status
      let maritalStatus: MaritalStatus | undefined;
      if (maritalStatusValue) {
        const msUpper = maritalStatusValue.toUpperCase();
        if (msUpper === 'BELUM MENIKAH' || msUpper === 'SINGLE' || msUpper === 'TK') {
          maritalStatus = MaritalStatus.SINGLE;
        } else if (msUpper === 'MENIKAH' || msUpper === 'MARRIED' || msUpper === 'K') {
          maritalStatus = MaritalStatus.MARRIED;
        } else if (msUpper === 'CERAI HIDUP' || msUpper === 'DIVORCED') {
          maritalStatus = MaritalStatus.DIVORCED;
        } else if (msUpper === 'CERAI MATI' || msUpper === 'WIDOWED') {
          maritalStatus = MaritalStatus.WIDOWED;
        } else {
          errors.push({ rowNumber, nik, field: 'maritalStatus', message: 'Status pernikahan tidak valid', originalValue: maritalStatusValue });
          return;
        }
      }

      // Validate city
      let cityId: string | undefined;
      if (cityCode) {
        const city = masterData.cities.get(cityCode);
        if (!city) {
          errors.push({ rowNumber, nik, field: 'city', message: `Kode kota tidak ditemukan: ${cityCode}`, originalValue: cityCode });
          return;
        }
        cityId = city.id;
      }

      // Validate current city
      let currentCityId: string | undefined;
      if (currentCityCode) {
        const currentCity = masterData.cities.get(currentCityCode);
        if (!currentCity) {
          errors.push({ rowNumber, nik, field: 'currentCity', message: `Kode kota domisili tidak ditemukan: ${currentCityCode}`, originalValue: currentCityCode });
          return;
        }
        currentCityId = currentCity.id;
      }

      // Validate division
      let divisionId: string | undefined;
      if (divisionCode) {
        const division = masterData.divisions.get(divisionCode);
        if (!division) {
          errors.push({ rowNumber, nik, field: 'division', message: `Kode divisi tidak ditemukan: ${divisionCode}`, originalValue: divisionCode });
          return;
        }
        divisionId = division.id;
      }

      // Validate department
      let departmentId: string | undefined;
      if (departmentCode) {
        const department = masterData.departments.get(departmentCode);
        if (!department) {
          errors.push({ rowNumber, nik, field: 'department', message: `Kode departemen tidak ditemukan: ${departmentCode}`, originalValue: departmentCode });
          return;
        }
        departmentId = department.id;
      }

      // Validate position
      let positionId: string | undefined;
      if (positionCode) {
        const position = masterData.positions.get(positionCode);
        if (!position) {
          errors.push({ rowNumber, nik, field: 'position', message: `Kode jabatan tidak ditemukan: ${positionCode}`, originalValue: positionCode });
          return;
        }
        positionId = position.id;
      }

      // Validate job grade
      let jobGradeId: string | undefined;
      if (jobGradeCode) {
        const jobGrade = masterData.jobGrades.get(jobGradeCode);
        if (!jobGrade) {
          errors.push({ rowNumber, nik, field: 'jobGrade', message: `Kode job grade tidak ditemukan: ${jobGradeCode}`, originalValue: jobGradeCode });
          return;
        }
        jobGradeId = jobGrade.id;
      }

      // Validate employment status
      let employmentStatusId: string | undefined;
      if (employmentStatusCode) {
        const employmentStatus = masterData.employmentStatuses.get(employmentStatusCode);
        if (!employmentStatus) {
          errors.push({ rowNumber, nik, field: 'employmentStatus', message: `Kode status kepegawaian tidak ditemukan: ${employmentStatusCode}`, originalValue: employmentStatusCode });
          return;
        }
        employmentStatusId = employmentStatus.id;
      }

      // Validate work location
      let workLocationId: string | undefined;
      if (workLocationCode) {
        const workLocation = masterData.workLocations.get(workLocationCode);
        if (!workLocation) {
          errors.push({ rowNumber, nik, field: 'workLocation', message: `Kode lokasi kerja tidak ditemukan: ${workLocationCode}`, originalValue: workLocationCode });
          return;
        }
        workLocationId = workLocation.id;
      }

      // Parse dates
      const joinDate = this.parseDate(joinDateValue);
      const contractStartDate = this.parseDate(contractStartDateValue);
      const contractEndDate = this.parseDate(contractEndDateValue);

      employees.push({
        rowNumber,
        nik,
        fullName,
        nickname,
        idCardNumber,
        gender: gender!,
        birthPlace,
        birthDate,
        religionId,
        bloodTypeId,
        maritalStatus,
        phoneNumber,
        email,
        address,
        cityId,
        postalCode,
        currentAddress,
        currentCityId,
        divisionId,
        departmentId,
        positionId,
        jobGradeId,
        employmentStatusId,
        workLocationId,
        joinDate,
        contractStartDate,
        contractEndDate,
        managerNik,
        bankName,
        bankAccountNumber,
        bankAccountHolderName,
        npwp,
        bpjsKesehatan,
        bpjsKetenagakerjaan,
      });
    });

    return employees;
  }
  // BUG FIX 3: Report errors for unknown employee NIK in family sheet
  private parseFamilySheet(
    sheet: ExcelJS.Worksheet,
    masterData: MasterDataMaps,
    parsedEmployeeNiks: Set<string>,
    errors: ImportErrorDto[],
  ): ParsedFamily[] {
    const families: ParsedFamily[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const employeeNik = this.getCellValue(row.getCell(1));
      const name = this.getCellValue(row.getCell(2));
      const relationshipTypeCode = this.getCellValue(row.getCell(3));
      const birthDateValue = this.getCellValue(row.getCell(4));
      const phoneNumber = this.getCellValue(row.getCell(5));
      const address = this.getCellValue(row.getCell(6));
      const isEmergencyContactValue = this.getCellValue(row.getCell(7));

      // Skip empty rows
      if (!employeeNik && !name) return;

      // Validate required fields
      if (!employeeNik) {
        errors.push({ rowNumber, nik: '', field: 'employeeNik', message: 'NIK karyawan wajib diisi', originalValue: '' });
        return;
      }
      if (!name) {
        errors.push({ rowNumber, nik: employeeNik, field: 'name', message: 'Nama anggota keluarga wajib diisi', originalValue: '' });
        return;
      }
      if (!relationshipTypeCode) {
        errors.push({ rowNumber, nik: employeeNik, field: 'relationshipType', message: 'Hubungan keluarga wajib diisi', originalValue: '' });
        return;
      }

      // BUG FIX 3: Check if employee NIK exists in parsed employees or database
      if (!parsedEmployeeNiks.has(employeeNik) && !masterData.existingNiks.has(employeeNik)) {
        errors.push({
          rowNumber,
          nik: employeeNik,
          field: 'employeeNik',
          message: `Karyawan dengan NIK ${employeeNik} tidak ditemukan dalam data import maupun database`,
          originalValue: employeeNik,
        });
        return;
      }

      // Validate relationship type
      const relationshipType = masterData.relationshipTypes.get(relationshipTypeCode);
      if (!relationshipType) {
        errors.push({ rowNumber, nik: employeeNik, field: 'relationshipType', message: `Kode hubungan keluarga tidak ditemukan: ${relationshipTypeCode}`, originalValue: relationshipTypeCode });
        return;
      }

      // Parse birth date
      const birthDate = this.parseDate(birthDateValue);

      // Parse emergency contact flag
      const isEmergencyContact = isEmergencyContactValue?.toUpperCase() === 'YA' || isEmergencyContactValue?.toUpperCase() === 'YES' || isEmergencyContactValue === '1';

      families.push({
        rowNumber,
        employeeNik,
        name,
        relationshipTypeId: relationshipType.id,
        birthDate,
        phoneNumber,
        address,
        isEmergencyContact,
      });
    });

    return families;
  }
  // BUG FIX 3: Report errors for unknown employee NIK in education sheet
  private parseEducationSheet(
    sheet: ExcelJS.Worksheet,
    masterData: MasterDataMaps,
    parsedEmployeeNiks: Set<string>,
    errors: ImportErrorDto[],
  ): ParsedEducation[] {
    const educations: ParsedEducation[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const employeeNik = this.getCellValue(row.getCell(1));
      const educationLevelCode = this.getCellValue(row.getCell(2));
      const institutionName = this.getCellValue(row.getCell(3));
      const major = this.getCellValue(row.getCell(4));
      const graduationYearValue = this.getCellValue(row.getCell(5));
      const gpaValue = this.getCellValue(row.getCell(6));

      // Skip empty rows
      if (!employeeNik && !institutionName) return;

      // Validate required fields
      if (!employeeNik) {
        errors.push({ rowNumber, nik: '', field: 'employeeNik', message: 'NIK karyawan wajib diisi', originalValue: '' });
        return;
      }
      if (!educationLevelCode) {
        errors.push({ rowNumber, nik: employeeNik, field: 'educationLevel', message: 'Jenjang pendidikan wajib diisi', originalValue: '' });
        return;
      }
      if (!institutionName) {
        errors.push({ rowNumber, nik: employeeNik, field: 'institutionName', message: 'Nama institusi wajib diisi', originalValue: '' });
        return;
      }

      // BUG FIX 3: Check if employee NIK exists in parsed employees or database
      if (!parsedEmployeeNiks.has(employeeNik) && !masterData.existingNiks.has(employeeNik)) {
        errors.push({
          rowNumber,
          nik: employeeNik,
          field: 'employeeNik',
          message: `Karyawan dengan NIK ${employeeNik} tidak ditemukan dalam data import maupun database`,
          originalValue: employeeNik,
        });
        return;
      }

      // Validate education level
      const educationLevel = masterData.educationLevels.get(educationLevelCode);
      if (!educationLevel) {
        errors.push({ rowNumber, nik: employeeNik, field: 'educationLevel', message: `Kode jenjang pendidikan tidak ditemukan: ${educationLevelCode}`, originalValue: educationLevelCode });
        return;
      }

      // Parse graduation year
      let graduationYear: number | undefined;
      if (graduationYearValue) {
        graduationYear = parseInt(graduationYearValue, 10);
        if (isNaN(graduationYear)) {
          errors.push({ rowNumber, nik: employeeNik, field: 'graduationYear', message: 'Tahun lulus harus berupa angka', originalValue: graduationYearValue });
          return;
        }
      }

      // Parse GPA
      let gpa: number | undefined;
      if (gpaValue) {
        gpa = parseFloat(gpaValue);
        if (isNaN(gpa)) {
          errors.push({ rowNumber, nik: employeeNik, field: 'gpa', message: 'IPK harus berupa angka', originalValue: gpaValue });
          return;
        }
      }

      educations.push({
        rowNumber,
        employeeNik,
        educationLevelId: educationLevel.id,
        institutionName,
        major,
        graduationYear,
        gpa,
      });
    });

    return educations;
  }
}