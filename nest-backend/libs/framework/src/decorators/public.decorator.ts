import { SetMetadata } from "@nestjs/common";

const IS_PUBLIC_KEY = Symbol('IS_PUBLIC');

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);