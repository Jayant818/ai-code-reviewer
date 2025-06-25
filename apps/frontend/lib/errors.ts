import { z } from "zod";

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: z.ZodError
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}
