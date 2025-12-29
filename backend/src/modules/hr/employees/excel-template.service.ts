
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as ExcelJS from 'exceljs';
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

@Injectable()
export class ExcelTemplateService {
  constructor(
    @InjectRepository(Division)
    private divisionRepository: Repository<Division>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(JobGrade)
    private jobGradeRepository: Repository<JobGrade>,
    @InjectRepository(EmploymentStatus)
    private employmentStatusRepository: Repository<EmploymentStatus>,
    @InjectRepository(WorkLocation)
    private workLocationRepository: Repository<WorkLocation>,
    @InjectRepository(Religion)
    private religionRepository: Repository<Religion>,
    @InjectRepository(BloodType)
    private bloodTypeRepository: Repository<BloodType>,
    @InjectRepository(EducationLevel)
    private educationLevelRepository: Repository<EducationLevel>,
    @InjectRepository(RelationshipType)
    private relationshipTypeRepository: Repository<RelationshipType>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Bebang BIS';
    workbook.created = new Date();

    const [
      divisions,
      departments,
      positions,
      jobGrades,
      employmentStatuses,
      workLocations,
      religions,
      bloodTypes,
      educationLevels,
      relationshipTypes,
      cities,
    ] = await Promise.all([
      this.divisionRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.departmentRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.positionRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.jobGradeRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.employmentStatusRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.workLocationRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.religionRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.bloodTypeRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.educationLevelRepository.find({ where: { deletedAt: IsNull() }, order: { level: 'ASC' } }),
      this.relationshipTypeRepository.find({ where: { deletedAt: IsNull() }, order: { code: 'ASC' } }),
      this.cityRepository.find({ where: { deletedAt: IsNull() }, order: { name: 'ASC' } }),
    ]);

    this.createReadMeSheet(workbook, {
      divisions,
      departments,
      positions,
      jobGrades,
      employmentStatuses,
      workLocations,
      religions,
      bloodTypes,
      educationLevels,
      relationshipTypes,
      cities,
    });

    this.createEmployeeSheet(workbook, {
      divisions,
      departments,
      positions,
      jobGrades,
      employmentStatuses,
      workLocations,
      religions,
      bloodTypes,
      cities,
    });

    this.createFamilySheet(workbook, { relationshipTypes });
    this.createEducationSheet(workbook, { educationLevels });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private createReadMeSheet(
    workbook: ExcelJS.Workbook,
    masterData: {
      divisions: Division[];
      departments: Department[];
      positions: Position[];
      jobGrades: JobGrade[];
      employmentStatuses: EmploymentStatus[];
      workLocations: WorkLocation[];
      religions: Religion[];
      bloodTypes: BloodType[];
      educationLevels: EducationLevel[];
      relationshipTypes: RelationshipType[];
      cities: City[];
    },
  ): void {
    const sheet = workbook.addWorksheet('READ_ME', {
      properties: { tabColor: { argb: 'FF0000' } },
    });

    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'PETUNJUK IMPORT DATA KARYAWAN';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    const instructions = [
      '',
      'PETUNJUK UMUM:',
      '1. Isi data karyawan pada sheet "KARYAWAN_HEAD"',
      '2. Isi data keluarga pada sheet "KELUARGA_DETAIL" (opsional)',
      '3. Isi data pendidikan pada sheet "PENDIDIKAN_DETAIL" (opsional)',
      '4. Gunakan kode yang tersedia pada referensi di bawah',
      '5. Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)',
      '6. Jangan mengubah header kolom',
      '7. Jangan menghapus atau menambah kolom',
      '',
      'KETERANGAN KOLOM WAJIB (*):',
      '- NIK: Nomor Induk Karyawan (unik)',
      '- Nama Lengkap: Nama lengkap karyawan',
      '- No KTP: Nomor KTP 16 digit',
      '- Jenis Kelamin: L (Laki-laki) atau P (Perempuan)',
      '- Tempat Lahir: Kota tempat lahir',
      '- Tanggal Lahir: Format YYYY-MM-DD',
      '',
      'KETERANGAN STATUS PERNIKAHAN:',
      '- SINGLE: Belum Menikah',
      '- MARRIED: Menikah',
      '- DIVORCED: Cerai',
      '- WIDOWED: Duda/Janda',
      '',
    ];

    let rowIndex = 2;
    instructions.forEach((text) => {
      const row = sheet.getRow(rowIndex);
      row.getCell(1).value = text;
      if (text.endsWith(':') && !text.startsWith('-')) {
        row.getCell(1).font = { bold: true };
      }
      rowIndex++;
    });

    rowIndex += 2;

    const addReferenceTable = (
      title: string,
      headers: string[],
      data: Array<{ code: string; name: string }>,
      startRow: number,
    ): number => {
      const titleRow = sheet.getRow(startRow);
      titleRow.getCell(1).value = title;
      titleRow.getCell(1).font = { bold: true, size: 12 };

      const headerRow = sheet.getRow(startRow + 1);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      data.forEach((item, index) => {
        const dataRow = sheet.getRow(startRow + 2 + index);
        dataRow.getCell(1).value = item.code;
        dataRow.getCell(2).value = item.name;
        [1, 2].forEach((col) => {
          dataRow.getCell(col).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      return startRow + 3 + data.length;
    };

    rowIndex = addReferenceTable('KODE AGAMA:', ['Kode', 'Nama'], masterData.religions, rowIndex);
    rowIndex = addReferenceTable('KODE GOLONGAN DARAH:', ['Kode', 'Nama'], masterData.bloodTypes, rowIndex);
    rowIndex = addReferenceTable('KODE DIVISI:', ['Kode', 'Nama'], masterData.divisions, rowIndex);
    rowIndex = addReferenceTable('KODE DEPARTEMEN:', ['Kode', 'Nama'], masterData.departments, rowIndex);
    rowIndex = addReferenceTable('KODE JABATAN:', ['Kode', 'Nama'], masterData.positions, rowIndex);
    rowIndex = addReferenceTable('KODE GRADE:', ['Kode', 'Nama'], masterData.jobGrades, rowIndex);
    rowIndex = addReferenceTable('KODE STATUS KARYAWAN:', ['Kode', 'Nama'], masterData.employmentStatuses, rowIndex);
    rowIndex = addReferenceTable('KODE LOKASI KERJA:', ['Kode', 'Nama'], masterData.workLocations, rowIndex);
    rowIndex = addReferenceTable('KODE TINGKAT PENDIDIKAN:', ['Kode', 'Nama'], masterData.educationLevels, rowIndex);
    rowIndex = addReferenceTable('KODE HUBUNGAN KELUARGA:', ['Kode', 'Nama'], masterData.relationshipTypes, rowIndex);

    const limitedCities = masterData.cities.slice(0, 100);
    addReferenceTable('KODE KOTA (100 pertama):', ['Kode', 'Nama'], limitedCities, rowIndex);

    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 40;
  }

  private createEmployeeSheet(
    workbook: ExcelJS.Workbook,
    masterData: {
      divisions: Division[];
      departments: Department[];
      positions: Position[];
      jobGrades: JobGrade[];
      employmentStatuses: EmploymentStatus[];
      workLocations: WorkLocation[];
      religions: Religion[];
      bloodTypes: BloodType[];
      cities: City[];
    },
  ): void {
    const sheet = workbook.addWorksheet('KARYAWAN_HEAD', {
      properties: { tabColor: { argb: '00FF00' } },
    });

    const columns = [
      { header: 'NIK *', key: 'nik', width: 20 },
      { header: 'Nama Lengkap *', key: 'fullName', width: 30 },
      { header: 'Nama Panggilan', key: 'nickname', width: 15 },
      { header: 'No KTP *', key: 'idCardNumber', width: 20 },
      { header: 'Jenis Kelamin *', key: 'gender', width: 15 },
      { header: 'Tempat Lahir *', key: 'birthPlace', width: 20 },
      { header: 'Tanggal Lahir *', key: 'birthDate', width: 15 },
      { header: 'Kode Agama', key: 'religionCode', width: 15 },
      { header: 'Kode Gol. Darah', key: 'bloodTypeCode', width: 15 },
      { header: 'Status Pernikahan', key: 'maritalStatus', width: 18 },
      { header: 'No Telepon', key: 'phoneNumber', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Alamat KTP', key: 'address', width: 40 },
      { header: 'Kode Kota', key: 'cityCode', width: 15 },
      { header: 'Kode Pos', key: 'postalCode', width: 12 },
      { header: 'Alamat Domisili', key: 'currentAddress', width: 40 },
      { header: 'Kode Kota Domisili', key: 'currentCityCode', width: 18 },
      { header: 'Kode Divisi', key: 'divisionCode', width: 15 },
      { header: 'Kode Departemen', key: 'departmentCode', width: 18 },
      { header: 'Kode Jabatan', key: 'positionCode', width: 15 },
      { header: 'Kode Grade', key: 'jobGradeCode', width: 15 },
      { header: 'Kode Status Karyawan', key: 'employmentStatusCode', width: 20 },
      { header: 'Kode Lokasi Kerja', key: 'workLocationCode', width: 18 },
      { header: 'Tanggal Bergabung', key: 'joinDate', width: 18 },
      { header: 'Tanggal Mulai Kontrak', key: 'contractStartDate', width: 20 },
      { header: 'Tanggal Akhir Kontrak', key: 'contractEndDate', width: 20 },
      { header: 'NIK Manager', key: 'managerNik', width: 20 },
      { header: 'Nama Bank', key: 'bankName', width: 20 },
      { header: 'No Rekening', key: 'bankAccountNumber', width: 20 },
      { header: 'Nama Pemilik Rekening', key: 'bankAccountHolder', width: 25 },
      { header: 'NPWP', key: 'taxNumber', width: 25 },
      { header: 'No BPJS Kesehatan', key: 'bpjsKesehatan', width: 20 },
      { header: 'No BPJS Ketenagakerjaan', key: 'bpjsKetenagakerjaan', width: 22 },
    ];

    sheet.columns = columns;

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    sheet.getRow(1).height = 25;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Add data validations
    const genderValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"L,P"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Gender',
      error: 'Please select L (Laki-laki) or P (Perempuan)',
    };

    const maritalStatusValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"SINGLE,MARRIED,DIVORCED,WIDOWED"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Marital Status',
      error: 'Please select a valid marital status',
    };

    const religionCodes = masterData.religions.map((r) => r.code).join(',');
    const religionValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${religionCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Religion Code',
      error: 'Please select a valid religion code from READ_ME sheet',
    };

    const bloodTypeCodes = masterData.bloodTypes.map((b) => b.code).join(',');
    const bloodTypeValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${bloodTypeCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Blood Type Code',
      error: 'Please select a valid blood type code from READ_ME sheet',
    };

    const divisionCodes = masterData.divisions.map((d) => d.code).join(',');
    const divisionValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${divisionCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Division Code',
      error: 'Please select a valid division code from READ_ME sheet',
    };

    const departmentCodes = masterData.departments.map((d) => d.code).join(',');
    const departmentValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${departmentCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Department Code',
      error: 'Please select a valid department code from READ_ME sheet',
    };

    const positionCodes = masterData.positions.map((p) => p.code).join(',');
    const positionValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${positionCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Position Code',
      error: 'Please select a valid position code from READ_ME sheet',
    };

    const jobGradeCodes = masterData.jobGrades.map((j) => j.code).join(',');
    const jobGradeValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${jobGradeCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Job Grade Code',
      error: 'Please select a valid job grade code from READ_ME sheet',
    };

    const employmentStatusCodes = masterData.employmentStatuses.map((e) => e.code).join(',');
    const employmentStatusValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${employmentStatusCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Employment Status Code',
      error: 'Please select a valid employment status code from READ_ME sheet',
    };

    const workLocationCodes = masterData.workLocations.map((w) => w.code).join(',');
    const workLocationValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${workLocationCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Work Location Code',
      error: 'Please select a valid work location code from READ_ME sheet',
    };

    // Apply validations to columns (rows 2-1000)
    for (let row = 2; row <= 1000; row++) {
      sheet.getCell(`E${row}`).dataValidation = genderValidation;
      sheet.getCell(`J${row}`).dataValidation = maritalStatusValidation;
      sheet.getCell(`H${row}`).dataValidation = religionValidation;
      sheet.getCell(`I${row}`).dataValidation = bloodTypeValidation;
      sheet.getCell(`R${row}`).dataValidation = divisionValidation;
      sheet.getCell(`S${row}`).dataValidation = departmentValidation;
      sheet.getCell(`T${row}`).dataValidation = positionValidation;
      sheet.getCell(`U${row}`).dataValidation = jobGradeValidation;
      sheet.getCell(`V${row}`).dataValidation = employmentStatusValidation;
      sheet.getCell(`W${row}`).dataValidation = workLocationValidation;
    }
  }

  private createFamilySheet(
    workbook: ExcelJS.Workbook,
    masterData: { relationshipTypes: RelationshipType[] },
  ): void {
    const sheet = workbook.addWorksheet('KELUARGA_DETAIL', {
      properties: { tabColor: { argb: 'FFA500' } },
    });

    const columns = [
      { header: 'NIK Karyawan *', key: 'employeeNik', width: 20 },
      { header: 'Nama *', key: 'name', width: 30 },
      { header: 'Kode Hubungan *', key: 'relationshipTypeCode', width: 18 },
      { header: 'Tanggal Lahir', key: 'birthDate', width: 15 },
      { header: 'No Telepon', key: 'phoneNumber', width: 15 },
      { header: 'Alamat', key: 'address', width: 40 },
      { header: 'Kontak Darurat (Y/N)', key: 'isEmergencyContact', width: 20 },
    ];

    sheet.columns = columns;

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFED7D31' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    sheet.getRow(1).height = 25;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const relationshipCodes = masterData.relationshipTypes.map((r) => r.code).join(',');
    const relationshipValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`"${relationshipCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Relationship Code',
      error: 'Please select a valid relationship code from READ_ME sheet',
    };

    const emergencyContactValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Y,N"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select Y (Yes) or N (No)',
    };

    for (let row = 2; row <= 1000; row++) {
      sheet.getCell(`C${row}`).dataValidation = relationshipValidation;
      sheet.getCell(`G${row}`).dataValidation = emergencyContactValidation;
    }
  }

  private createEducationSheet(
    workbook: ExcelJS.Workbook,
    masterData: { educationLevels: EducationLevel[] },
  ): void {
    const sheet = workbook.addWorksheet('PENDIDIKAN_DETAIL', {
      properties: { tabColor: { argb: '0000FF' } },
    });

    const columns = [
      { header: 'NIK Karyawan *', key: 'employeeNik', width: 20 },
      { header: 'Kode Tingkat Pendidikan *', key: 'educationLevelCode', width: 25 },
      { header: 'Nama Institusi *', key: 'institutionName', width: 35 },
      { header: 'Jurusan', key: 'major', width: 25 },
      { header: 'Tahun Lulus', key: 'graduationYear', width: 15 },
      { header: 'IPK', key: 'gpa', width: 10 },
    ];

    sheet.columns = columns;

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    sheet.getRow(1).height = 25;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const educationCodes = masterData.educationLevels.map((e) => e.code).join(',');
    const educationValidation: ExcelJS.DataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`"${educationCodes}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Education Level Code',
      error: 'Please select a valid education level code from READ_ME sheet',
    };

    for (let row = 2; row <= 1000; row++) {
      sheet.getCell(`B${row}`).dataValidation = educationValidation;
    }
  }
}