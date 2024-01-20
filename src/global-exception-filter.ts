import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, _: ArgumentsHost) {
        if (exception instanceof RpcException) {
          // If it's already an RcpException, leave it unchanged
          console.log(exception)
          return throwError(() => new RpcException(exception.getError()));
        } else {
          // Throw a new RcpException for other types of exceptions
          console.log(exception)
          return throwError(() => new RpcException(JSON.stringify(exception)));
        }
      }
    }