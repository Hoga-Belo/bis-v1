import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let errors: Record<string, string[]> | undefined;

    // Log the actual error for debugging
    if (exception instanceof Error) {
      this.logger.error(
        `Exception caught: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception caught:', exception);
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;

        // Handle validation errors from class-validator
        if (Array.isArray(responseObj.message)) {
          errors = this.formatValidationErrors(responseObj.message as string[]);
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        }
      }

      // Map HTTP status to error codes
      errorCode = this.getErrorCode(status, errorCode);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      error_code: errorCode,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    messages.forEach((msg) => {
      // Try to extract field name from validation message
      const match = msg.match(/^(\w+)\s/);
      const field = match ? match[1].toLowerCase() : 'general';

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(msg);
    });

    return errors;
  }

  private getErrorCode(status: number, defaultCode: string): string {
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };

    return statusCodeMap[status] || defaultCode;
  }
}
