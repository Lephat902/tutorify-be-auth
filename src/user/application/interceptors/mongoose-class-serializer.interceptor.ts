import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';
import { Tutor, User } from '../../infrastructure/schemas';
import { UserRole } from '../../../../../shared/src';

function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(document: PlainLiteralObject) {
      if (!(document instanceof Document)) {
        return document;
      }

      const object = plainToClass(classToIntercept, document.toJSON());

      let classType = object?.role || classToIntercept;

      if (classType) {
        switch (classType) {
          case UserRole.TUTOR:
            classType = Tutor;
            break;
        }
      }

      return plainToClass(classType, document.toJSON());
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

export default MongooseClassSerializerInterceptor;
