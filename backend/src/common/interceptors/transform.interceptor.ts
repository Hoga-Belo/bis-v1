import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the response structure, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Check if response includes pagination meta (supports both 'items' and 'data' keys)
        if (data && typeof data === 'object' && 'meta' in data) {
          // Handle { items, meta } format
          if ('items' in data) {
            return {
              success: true,
              message: 'Success',
              data: data.items,
              meta: data.meta,
            };
          }
          // Handle { data, meta } format (e.g., from audit service)
          if ('data' in data) {
            return {
              success: true,
              message: 'Success',
              data: data.data,
              meta: data.meta,
            };
          }
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
