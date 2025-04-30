import {
  applyDecorators,
  Controller as NestController,
  UseInterceptors,
} from '@nestjs/common';

export const AppController = (path?: string) => {
  return applyDecorators(NestController(path), UseInterceptors());
};
