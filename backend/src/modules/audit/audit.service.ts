import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit/audit-log.entity';
import { CreateAuditLogDto, AuditQueryDto } from './dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      module: dto.module,
      entityType: dto.entityType,
      tableName: dto.tableName,
      recordId: dto.recordId || null,
      action: dto.action,
      description: dto.description || null,
      oldValue: dto.oldValue || null,
      newValue: dto.newValue || null,
      userId: dto.userId || null,
      ipAddress: dto.ipAddress || null,
      userAgent: dto.userAgent || null,
    });
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(query: AuditQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      module,
      userId,
      action,
      dateStart,
      dateEnd,
      tableName,
      recordId,
      entityType,
    } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .select([
        'audit.id',
        'audit.module',
        'audit.entityType',
        'audit.tableName',
        'audit.recordId',
        'audit.action',
        'audit.description',
        'audit.oldValue',
        'audit.newValue',
        'audit.ipAddress',
        'audit.userAgent',
        'audit.createdAt',
        'user.id',
        'user.nik',
      ])
      .orderBy('audit.createdAt', 'DESC');

    // Search in description or user NIK
    if (search) {
      queryBuilder.andWhere(
        '(audit.description ILIKE :search OR user.nik ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (module) {
      queryBuilder.andWhere('audit.module = :module', { module });
    }
    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }
    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }
    if (tableName) {
      queryBuilder.andWhere('audit.tableName = :tableName', { tableName });
    }
    if (recordId) {
      queryBuilder.andWhere('audit.recordId = :recordId', { recordId });
    }
    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }
    if (dateStart && dateEnd) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :dateStart AND :dateEnd', {
        dateStart,
        dateEnd,
      });
    } else if (dateStart) {
      queryBuilder.andWhere('audit.createdAt >= :dateStart', { dateStart });
    } else if (dateEnd) {
      queryBuilder.andWhere('audit.createdAt <= :dateEnd', { dateEnd });
    }

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

  async findByRecord(tableName: string, recordId: string) {
    return this.auditLogRepository.find({
      where: { tableName, recordId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }
}