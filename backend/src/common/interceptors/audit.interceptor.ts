import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { AuditService } from '../../modules/audit/audit.service';
import { AuditAction } from '../../entities/audit/audit-log.entity';
import {
  extractEntityInfo,
  extractRecordId,
  sanitizeValue,
  buildDescription,
  mapMethodToAction,
  shouldAudit,
  getEntityFromTableName,
} from '../utils/audit.helper';

interface AuthenticatedUser {
  id: string;
  nik?: string;
  email?: string;
}

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
  ip?: string;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, body } = request;
    const ip = request.ip || request.socket?.remoteAddress || '';
    const userAgentHeader = request.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader || '';

    // Check if this request should be audited
    if (!shouldAudit(url, method)) {
      return next.handle();
    }

    // Extract entity info from URL
    const entityInfo = extractEntityInfo(url);
    if (!entityInfo) {
      return next.handle();
    }

    // Get action from HTTP method
    const action = mapMethodToAction(method);
    if (!action) {
      return next.handle();
    }

    // Get user from request (attached by JwtAuthGuard)
    const user = request.user;
    const userId = user?.id;

    // For UPDATE/DELETE, we need the record ID
    const recordId = extractRecordId(url);

    // For UPDATE/DELETE, fetch old value before the operation
    const shouldFetchOldValue =
      (action === 'UPDATE' || action === 'DELETE') && recordId;

    // Use mergeMap to handle async old value fetching
    return from(
      shouldFetchOldValue
        ? this.fetchOldValue(entityInfo.tableName, recordId)
        : Promise.resolve(null),
    ).pipe(
      mergeMap((oldValue) =>
        next.handle().pipe(
          tap({
            next: (responseData) => {
              // Don't block response - log asynchronously
              this.logAudit({
                action,
                entityInfo,
                recordId,
                userId,
                ip,
                userAgent,
                requestBody: body,
                responseData,
                user,
                oldValue,
              }).catch((err) => {
                console.error('Audit logging failed:', err);
              });
            },
            error: () => {
              // Don't log failed operations
            },
          }),
        ),
      ),
    );
  }

  /**
   * Fetch the current entity state before UPDATE/DELETE
   */
  private async fetchOldValue(
    tableName: string,
    recordId: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const entityClass = getEntityFromTableName(tableName);
      if (!entityClass) {
        console.warn(`No entity mapping found for table: ${tableName}`);
        return null;
      }

      const repository = this.dataSource.getRepository(entityClass);
      const entity = await repository.findOne({
        where: { id: recordId } as Record<string, unknown>,
      });

      if (!entity) {
        return null;
      }

      // Convert entity to plain object and sanitize
      return sanitizeValue(entity as Record<string, unknown>);
    } catch (error) {
      console.error(`Failed to fetch old value for ${tableName}:${recordId}:`, error);
      return null;
    }
  }

  private async logAudit(params: {
    action: string;
    entityInfo: { module: string; entityType: string; tableName: string };
    recordId: string | null;
    userId: string | undefined;
    ip: string;
    userAgent: string;
    requestBody: unknown;
    responseData: unknown;
    user: AuthenticatedUser | undefined;
    oldValue: Record<string, unknown> | null;
  }): Promise<void> {
    const {
      action,
      entityInfo,
      recordId,
      userId,
      ip,
      userAgent,
      requestBody,
      responseData,
      user,
      oldValue: fetchedOldValue,
    } = params;

    // Extract record ID from response if not in URL (for CREATE)
    let finalRecordId = recordId;
    const responseObj = responseData as Record<string, unknown> | null;

    if (!finalRecordId && responseObj?.data) {
      const dataObj = responseObj.data as Record<string, unknown>;
      if (dataObj?.id) {
        finalRecordId = dataObj.id as string;
      }
    }
    if (!finalRecordId && responseObj?.id) {
      finalRecordId = responseObj.id as string;
    }

    // Skip if we still don't have a record ID
    if (!finalRecordId) {
      return;
    }

    // Sanitize values
    const sanitizedBody = sanitizeValue(requestBody);
    const sanitizedResponse = sanitizeValue(
      responseObj?.data || responseData,
    );

    // Build description
    const userName = user?.nik || user?.email || 'Unknown';
    const description = buildDescription(
      action,
      entityInfo.entityType,
      userName,
      finalRecordId,
    );

    // Determine old/new values based on action
    let oldValue: Record<string, unknown> | undefined = undefined;
    let newValue: Record<string, unknown> | undefined = undefined;

    if (action === 'CREATE') {
      // For CREATE: old_value is null, new_value is the created entity
      oldValue = undefined;
      newValue = sanitizedResponse || undefined;
    } else if (action === 'UPDATE') {
      // For UPDATE: old_value is the fetched entity before update, new_value is the updated entity
      oldValue = fetchedOldValue || undefined;
      newValue = sanitizedResponse || sanitizedBody || undefined;
    } else if (action === 'DELETE') {
      // For DELETE: old_value is the fetched entity before delete, new_value is null
      oldValue = fetchedOldValue || undefined;
      newValue = undefined;
    }

    // Map action string to AuditAction enum
    const auditAction = AuditAction[action as keyof typeof AuditAction];

    // Create audit log
    await this.auditService.createLog({
      module: entityInfo.module,
      entityType: entityInfo.entityType,
      tableName: entityInfo.tableName,
      recordId: finalRecordId,
      action: auditAction,
      description,
      oldValue,
      newValue,
      userId,
      ipAddress: ip,
      userAgent,
    });
  }
}