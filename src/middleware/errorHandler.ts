import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error("Error:", err);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  sendError(res, "Internal server error", 500);
}
