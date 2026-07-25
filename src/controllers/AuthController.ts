import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { sendSuccess, sendCreated, sendError } from "../utils/response";
import { AppError } from "../utils/AppError";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, "Register successful");
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const profile = await authService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
