import { orderRepository } from "../repositories/OrderRepository";
import { generateOrderNumber } from "../utils/orderNumber";
import { AppError } from "../utils/AppError";
import ExcelJS from "exceljs";

export class OrderService {
  async getAllOrders(
    userId: string,
    options: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const { orders, total } = await orderRepository.findAll(userId, options);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getOrderById(id: string, userId: string) {
    const order = await orderRepository.findById(id, userId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  }

  async createOrder(
    userId: string,
    data: {
      client: string;
      todo: string;
      price: number;
      description?: string;
    }
  ) {
    const orderNumber = await generateOrderNumber();

    const order = await orderRepository.create({
      userId,
      orderNumber,
      client: data.client,
      todo: data.todo,
      price: data.price,
      description: data.description,
    });

    return order;
  }

  async updateOrder(
    id: string,
    userId: string,
    data: {
      client?: string;
      todo?: string;
      price?: number;
      status?: string;
      description?: string;
    }
  ) {
    const order = await orderRepository.update(id, userId, data);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  }

  async deleteOrder(id: string, userId: string) {
    const deleted = await orderRepository.delete(id, userId);
    if (!deleted) {
      throw new AppError("Order not found", 404);
    }

    return { message: "Order deleted successfully" };
  }

  async getDashboardStats(userId: string) {
    const statusCounts = await orderRepository.countByStatus(userId);
    const totalOrders = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    return {
      totalOrders,
      pendingOrders: statusCounts["Pending"] || 0,
      onProgressOrders: statusCounts["On Progress"] || 0,
      completedOrders: statusCounts["Completed"] || 0,
    };
  }

  async exportOrders(userId: string): Promise<ExcelJS.Buffer> {
    const orders = await orderRepository.findAllByUserId(userId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Order Number", key: "orderNumber", width: 18 },
      { header: "Client", key: "client", width: 25 },
      { header: "To Do", key: "todo", width: 30 },
      { header: "Price", key: "price", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Description", key: "description", width: 35 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        client: order.client,
        todo: order.todo,
        price: order.price,
        status: order.status,
        description: order.description || "",
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async importOrders(
    userId: string,
    filePath: string
  ): Promise<{ imported: number; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new AppError("Excel file is empty or invalid", 400);
    }

    const errors: string[] = [];
    const rows: { client: string; todo: string; price: number; status: string; description?: string }[] = [];
    const validStatuses = ["Pending", "On Progress", "Revision", "Completed", "Cancelled"];
    let imported = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const client = row.getCell(1).toString().trim();
      const todo = row.getCell(2).toString().trim();
      const priceStr = row.getCell(3).toString().trim();
      const status = row.getCell(4).toString().trim() || "Pending";
      const description = row.getCell(5).toString().trim();

      const rowErrors: string[] = [];

      if (!client) rowErrors.push(`Row ${rowNumber}: Client is required`);
      if (!todo) rowErrors.push(`Row ${rowNumber}: To Do is required`);
      if (!priceStr || isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
        rowErrors.push(`Row ${rowNumber}: Price must be a positive number`);
      }
      if (status && !validStatuses.includes(status)) {
        rowErrors.push(`Row ${rowNumber}: Invalid status "${status}". Allowed: ${validStatuses.join(", ")}`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        return;
      }

      rows.push({
        client,
        todo,
        price: Number(priceStr),
        status,
        description: description || undefined,
      });
    });

    if (errors.length > 0) {
      return { imported: 0, errors };
    }

    for (const row of rows) {
      const orderNumber = await generateOrderNumber();
      await orderRepository.create({
        userId,
        orderNumber,
        ...row,
      });
      imported++;
    }

    return { imported, errors };
  }
}

export const orderService = new OrderService();