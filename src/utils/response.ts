import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

export function sendSuccess<T>(res: Response, data: T, message = "Success"): void {
  const response: ApiResponse<T> = {
    message,
    data,
  };
  res.status(200).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  const response: ApiResponse<T> = {
    message,
    data,
  };
  res.status(201).json(response);
}

export function sendError(res: Response, message = "Something went wrong", statusCode = 500): void {
  const response: ApiResponse = {
    message,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): void {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
    },
  };
  res.status(200).json(response);
}
