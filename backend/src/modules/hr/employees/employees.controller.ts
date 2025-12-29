
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { RequirePermissions, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser } from '../../auth/auth.service';
import { EmployeesService } from './employees.service';
import { ExcelTemplateService } from './excel-template.service';
import { ExcelImportService } from './excel-import.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
  CreateEmployeeFamilyDto,
  CreateEmployeeEducationDto,
} from './dto';
import { photoUploadConfig, documentUploadConfig, excelUploadConfig } from '../../../config/upload.config';
import { DocumentType } from '../../../entities/hr/employee-document.entity';

@ApiTags('HR - Employees')
@ApiBearerAuth()
@Controller('hr/employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly excelTemplateService: ExcelTemplateService,
    private readonly excelImportService: ExcelImportService,
  ) {}

  // ==================== Employee CRUD ====================

  @Get()
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get all employees with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of employees retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get employee statistics for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalActive: { type: 'number', description: 'Total active employees' },
        newHiresThisMonth: { type: 'number', description: 'New hires this month' },
        onLeave: { type: 'number', description: 'Employees on leave' },
        contractsExpiringSoon: { type: 'number', description: 'Contracts expiring in next 30 days' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async getStatistics() {
    return this.employeesService.getStatistics();
  }

  @Get('contracts/expiring')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get employees with expiring contracts' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look ahead (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees with expiring contracts',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async getExpiringContracts(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.employeesService.getContractExpiringEmployees(days);
  }

  // ==================== Excel Import ====================

  @Get('import/template')
  @RequirePermissions('hr:employee:create')
  @ApiOperation({ summary: 'Download Excel import template' })
  @ApiResponse({
    status: 200,
    description: 'Excel template file',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.excelTemplateService.generateTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=template_import_karyawan.xlsx',
    );
    res.send(buffer);
  }

  @Post('import')
  @RequirePermissions('hr:employee:create')
  @UseInterceptors(FileInterceptor('file', excelUploadConfig))
  @ApiOperation({ summary: 'Import employees from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx, max 20MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Import completed',
    schema: {
      type: 'object',
      properties: {
        totalRows: { type: 'number', description: 'Total rows processed' },
        successCount: { type: 'number', description: 'Successfully imported' },
        errorCount: { type: 'number', description: 'Failed rows' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rowNumber: { type: 'number' },
              nik: { type: 'string' },
              field: { type: 'string' },
              message: { type: 'string' },
              originalValue: { type: 'string' },
            },
          },
        },
        errorReportPath: { type: 'string', description: 'Error report filename' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.excelImportService.importFromExcel(file, user.id);
  }

  @Get('import/errors/:filename')
  @RequirePermissions('hr:employee:create')
  @ApiOperation({ summary: 'Download error report from import' })
  @ApiParam({ name: 'filename', description: 'Error report filename' })
  @ApiResponse({
    status: 200,
    description: 'Error report Excel file',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Error report not found' })
  async downloadErrorReport(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join('./uploads/temp', filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Error report not found' });
      return;
    }
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get(':id')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get a single employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.findOne(id, user.permissions || []);
  }

  @Post()
  @RequirePermissions('hr:employee:create')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employee with NIK or ID Card already exists',
  })
  async create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.create(dto, user.id, user.permissions || []);
  }

  @Patch(':id')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employee with NIK or ID Card already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.update(id, dto, user.id, user.permissions || []);
  }

  @Delete(':id')
  @RequirePermissions('hr:employee:delete')
  @ApiOperation({ summary: 'Soft delete an employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Employee has subordinates',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.remove(id, user.id);
  }

  // ==================== Photo Upload ====================

  @Post(':id/photo')
  @RequirePermissions('hr:employee:update')
  @UseInterceptors(FileInterceptor('photo', photoUploadConfig))
  @ApiOperation({ summary: 'Upload employee photo' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Photo file (jpg, jpeg, png, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const photoUrl = `/uploads/photos/${file.filename}`;
    return this.employeesService.uploadPhoto(id, photoUrl, user.id);
  }

  // ==================== Family Members ====================

  @Get(':id/families')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get employee family members' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,
    description: 'Family members retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getFamilies(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.getFamilies(id);
  }

  @Post(':id/families')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Add a family member to employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 201, description: 'Family member added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async addFamily(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeFamilyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.addFamily(id, dto, user.id);
  }

  @Patch('families/:familyId')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Update a family member' })
  @ApiParam({ name: 'familyId', description: 'Family member UUID' })
  @ApiResponse({
    status: 200,
    description: 'Family member updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Family member not found' })
  async updateFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @Body() dto: Partial<CreateEmployeeFamilyDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.updateFamily(familyId, dto, user.id);
  }

  @Delete('families/:familyId')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Delete a family member' })
  @ApiParam({ name: 'familyId', description: 'Family member UUID' })
  @ApiResponse({
    status: 200,
    description: 'Family member deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Family member not found' })
  async removeFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.removeFamily(familyId, user.id);
  }

  // ==================== Education Records ====================

  @Get(':id/educations')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get employee education records' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,
    description: 'Education records retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEducations(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.getEducations(id);
  }

  @Post(':id/educations')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Add an education record to employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 201,
    description: 'Education record added successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async addEducation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeEducationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.addEducation(id, dto, user.id);
  }

  @Patch('educations/:educationId')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Update an education record' })
  @ApiParam({ name: 'educationId', description: 'Education record UUID' })
  @ApiResponse({
    status: 200,
    description: 'Education record updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Education record not found' })
  async updateEducation(
    @Param('educationId', ParseUUIDPipe) educationId: string,
    @Body() dto: Partial<CreateEmployeeEducationDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.updateEducation(educationId, dto, user.id);
  }

  @Delete('educations/:educationId')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Delete an education record' })
  @ApiParam({ name: 'educationId', description: 'Education record UUID' })
  @ApiResponse({
    status: 200,
    description: 'Education record deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Education record not found' })
  async removeEducation(
    @Param('educationId', ParseUUIDPipe) educationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.removeEducation(educationId, user.id);
  }

  // ==================== Documents ====================

  @Get(':id/documents')
  @RequirePermissions('hr:employee:read')
  @ApiOperation({ summary: 'Get employee documents' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getDocuments(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.getDocuments(id);
  }

  @Post(':id/documents')
  @RequirePermissions('hr:employee:update')
  @UseInterceptors(FileInterceptor('document', documentUploadConfig))
  @ApiOperation({ summary: 'Upload a document for employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['document', 'documentType', 'documentName'],
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description: 'Document file (pdf, doc, docx, max 10MB)',
        },
        documentType: {
          type: 'string',
          enum: Object.values(DocumentType),
          description: 'Type of document',
        },
        documentName: {
          type: 'string',
          description: 'Name of the document',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: DocumentType,
    @Body('documentName') documentName: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const fileUrl = `/uploads/documents/${file.filename}`;
    return this.employeesService.uploadDocument(
      id,
      documentType,
      documentName,
      fileUrl,
      file.size,
      user.id,
    );
  }

  @Delete('documents/:documentId')
  @RequirePermissions('hr:employee:update')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing required permissions',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async removeDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.removeDocument(documentId, user.id);
  }
}