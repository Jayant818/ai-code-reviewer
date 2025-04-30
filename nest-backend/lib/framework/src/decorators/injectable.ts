import { applyDecorators, Injectable as NestInjectable } from '@nestjs/common';

export const AppInjectable = () => {
  return applyDecorators(NestInjectable);
};
