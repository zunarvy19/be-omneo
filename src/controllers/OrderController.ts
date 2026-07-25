import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/OrderService";
import { sendSuccess, sendCreated, sendPaginated, sendError } from "../utils/response";
import { AppError } from "../utils/AppError";

export class OrderController {
  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { search, status, page, limit } = req.query;
      const result = await orderService.getAllOrders(userId, {
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      sendPaginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(id, userId);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const order = await orderService.createOrder(userId, req.body);
      sendCreated(res, order, "Order created successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { id } = req.params;
      const order = await orderService.updateOrder(id, userId, req.body);
      sendSuccess(res, order, "Order updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { id } = req.params;
      const result = await orderService.deleteOrder(id, userId);
      sendSuccess(res, result, "Order deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const stats = await orderService.getDashboardStats(userId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async exportOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const buffer = await orderService.exportOrders(userId);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=orders-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async importOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const result = await orderService.importOrders(userId, req.file.path);
      sendSuccess(res, result, `${result.imported} orders imported successfully`);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
