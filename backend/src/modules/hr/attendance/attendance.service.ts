import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../../../entities/hr/attendance.entity';
import { Employee, EmployeeStatus } from '../../../entities/hr/employee.entity';
import {
  ClockInDto,
  ClockOutDto,
  AttendanceQueryDto,
  UpdateAttendanceStatusDto,
} from './dto';

// Timezone for Asia/Jakarta (UTC+7)
const JAKARTA_OFFSET = 7 * 60 * 60 * 1000;

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Get current date in Asia/Jakarta timezone
   */
  private getJakartaDate(): Date {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    return new Date(utc + JAKARTA_OFFSET);
  }

  /**
   * Get today's date string in YYYY-MM-DD format (Jakarta timezone)
   */
  private getTodayDateString(): string {
    const jakartaDate = this.getJakartaDate();
    return jakartaDate.toISOString().split('T')[0];
  }

  /**
   * Get current hour in Jakarta timezone
   */
  private getJakartaHour(): number {
    return this.getJakartaDate().getHours();
  }

  /**
   * Get current minute in Jakarta timezone
   */
  private getJakartaMinute(): number {
    return this.getJakartaDate().getMinutes();
  }

  /**
   * Check if current time is past the late threshold (08:00)
   */
  private isLate(): boolean {
    const hour = this.getJakartaHour();
    const minute = this.getJakartaMinute();
    return hour > 8 || (hour === 8 && minute > 0);
  }

  /**
   * Validate that employee exists and is active
   */
  private async validateEmployee(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, deletedAt: IsNull() },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (employee.employeeStatus !== EmployeeStatus.ACTIVE) {
      throw new BadRequestException('Employee is not active');
    }

    return employee;
  }

  /**
   * Clock in for an employee
   */
  async clockIn(employeeId: string, dto: ClockInDto): Promise<Attendance> {
    // Validate employee
    await this.validateEmployee(employeeId);

    const todayDate = this.getTodayDateString();

    // Check if already clocked in today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        attendanceDate: new Date(todayDate),
        deletedAt: IsNull(),
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Already clocked in today');
    }

    // Determine status based on time
    const status = this.isLate() ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    // Create attendance record
    const attendance = this.attendanceRepository.create({
      employeeId,
      attendanceDate: new Date(todayDate),
      clockInTime: new Date(),
      clockInLocation: dto.location || null,
      clockInMethod: dto.method,
      status,
      notes: dto.qrCode ? `QR Code: ${dto.qrCode}` : null,
    });

    return this.attendanceRepository.save(attendance);
  }

  /**
   * Clock out for an employee
   */
  async clockOut(employeeId: string, dto: ClockOutDto): Promise<Attendance> {
    const todayDate = this.getTodayDateString();

    // Find today's attendance record
    const attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        attendanceDate: new Date(todayDate),
        deletedAt: IsNull(),
      },
    });

    if (!attendance) {
      throw new NotFoundException('No clock-in record found for today');
    }

    if (attendance.clockOutTime) {
      throw new ConflictException('Already clocked out today');
    }

    // Calculate work hours
    const clockOutTime = new Date();
    const clockInTime = new Date(attendance.clockInTime!);
    const workHoursMs = clockOutTime.getTime() - clockInTime.getTime();
    const workHours = Math.round((workHoursMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places

    // Update attendance record
    attendance.clockOutTime = clockOutTime;
    attendance.clockOutLocation = dto.location || null;
    attendance.workHours = workHours;

    return this.attendanceRepository.save(attendance);
  }

  /**
   * Get attendance records for the logged-in employee
   */
  async getMyAttendance(employeeId: string, query: AttendanceQueryDto) {
    const { page = 1, limit = 10, startDate, endDate, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.employeeId = :employeeId', { employeeId })
      .andWhere('attendance.deletedAt IS NULL');

    if (startDate) {
      queryBuilder.andWhere('attendance.attendanceDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('attendance.attendanceDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    queryBuilder.orderBy('attendance.attendanceDate', 'DESC');

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get attendance records for a specific employee (for manager/HR)
   */
  async getAttendanceByEmployee(employeeId: string, query: AttendanceQueryDto) {
    // Validate employee exists
    await this.validateEmployee(employeeId);

    const { page = 1, limit = 10, startDate, endDate, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.employeeId = :employeeId', { employeeId })
      .andWhere('attendance.deletedAt IS NULL');

    if (startDate) {
      queryBuilder.andWhere('attendance.attendanceDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('attendance.attendanceDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    queryBuilder.orderBy('attendance.attendanceDate', 'DESC');

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data: data.map((attendance) => ({
        ...attendance,
        employee: attendance.employee
          ? {
              id: attendance.employee.id,
              nik: attendance.employee.nik,
              fullName: attendance.employee.fullName,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get attendance statistics for an employee for a specific month
   */
  async getAttendanceStatistics(employeeId: string, month: number, year: number) {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be between 2000 and 2100');
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Get all attendance records for the month
    const attendances = await this.attendanceRepository.find({
      where: {
        employeeId,
        attendanceDate: Between(startDate, endDate),
        deletedAt: IsNull(),
      },
    });

    // Count by status
    const statusCounts: Record<AttendanceStatus, number> = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.LATE]: 0,
      [AttendanceStatus.ABSENT]: 0,
      [AttendanceStatus.LEAVE]: 0,
      [AttendanceStatus.SICK]: 0,
      [AttendanceStatus.PERMIT]: 0,
    };

    let totalWorkHours = 0;

    for (const attendance of attendances) {
      statusCounts[attendance.status]++;
      if (attendance.workHours) {
        totalWorkHours += Number(attendance.workHours);
      }
    }

    // Calculate working days in the month (excluding weekends)
    let workingDays = 0;
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      month,
      year,
      workingDays,
      totalRecords: attendances.length,
      statusCounts,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      averageWorkHours:
        attendances.length > 0
          ? Math.round((totalWorkHours / attendances.length) * 100) / 100
          : 0,
    };
  }

  /**
   * Update attendance status (for HR Admin manual override)
   */
  async updateAttendanceStatus(
    id: string,
    dto: UpdateAttendanceStatusDto,
    updatedBy: string,
  ): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    attendance.status = dto.status;
    if (dto.notes !== undefined) {
      attendance.notes = dto.notes;
    }
    attendance.updatedBy = updatedBy;

    return this.attendanceRepository.save(attendance);
  }

  /**
   * Get today's attendance record for an employee
   */
  async getTodayAttendance(employeeId: string): Promise<Attendance | null> {
    const todayDate = this.getTodayDateString();

    return this.attendanceRepository.findOne({
      where: {
        employeeId,
        attendanceDate: new Date(todayDate),
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get all attendance records with filters (for admin)
   */
  async findAll(query: AttendanceQueryDto) {
    const { page = 1, limit = 10, startDate, endDate, status, employeeId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.deletedAt IS NULL');

    if (employeeId) {
      queryBuilder.andWhere('attendance.employeeId = :employeeId', { employeeId });
    }

    if (startDate) {
      queryBuilder.andWhere('attendance.attendanceDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('attendance.attendanceDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    queryBuilder.orderBy('attendance.attendanceDate', 'DESC');

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data: data.map((attendance) => ({
        ...attendance,
        employee: attendance.employee
          ? {
              id: attendance.employee.id,
              nik: attendance.employee.nik,
              fullName: attendance.employee.fullName,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}