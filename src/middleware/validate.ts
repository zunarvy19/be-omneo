import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/response";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.errors.map((err) => err.message).join(", ");
      sendError(res, errorMessage, 400);
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errorMessage = result.error.errors.map((err) => err.message).join(", ");
      sendError(res, errorMessage, 400);
      return;
    }

    req.query = result.data as Record<string, string>;
    next();
  };
}
