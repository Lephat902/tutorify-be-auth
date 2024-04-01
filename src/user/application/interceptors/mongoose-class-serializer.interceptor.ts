import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';
import { Student, Tutor, User } from '../../infrastructure/schemas';
import { UserRole } from '@tutorify/shared';

export function MongooseClassSerializerInterceptor(): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(document: PlainLiteralObject) {
      if (!(document instanceof Document)) {
        return document;
      }

      let classToIntercept: Type<User>;

      switch ((document as unknown as User)?.role) {
        case UserRole.TUTOR:
          classToIntercept = Tutor;
          break;
        case UserRole.STUDENT:
          classToIntercept = Student;
          break;
        case UserRole.ADMIN:
        case UserRole.MANAGER:
        default:
          classToIntercept = User;
      }

      return plainToClass(classToIntercept, document.toJSON());
    }

    private prepareResponse(
      response:
        | PlainLiteralObject
        | PlainLiteralObject[]
        | { results: PlainLiteralObject[]; totalCount: number },
    ) {
      if (!Array.isArray(response) && response?.results) {
        const results = this.prepareResponse(response.results);
        return {
          totalCount: response.totalCount,
          results,
        };
      }

      if (Array.isArray(response)) {
        return response.map((document) =>
          this.changePlainObjectToClass(document),
        );
      }

      return this.changePlainObjectToClass(response);
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}