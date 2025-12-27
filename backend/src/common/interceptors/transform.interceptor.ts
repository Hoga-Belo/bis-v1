import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the response structure, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Check if response includes pagination meta
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            message: 'Success',
            data: data.items,
            meta: data.meta,
          };
        }

        return {
          success: true,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
