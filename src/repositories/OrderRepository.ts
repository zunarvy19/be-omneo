import prisma from "../config/prisma";
import { Order, Prisma } from "@prisma/client";

export class OrderRepository {
  async findAll(
    userId: string,
    options: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ orders: Order[]; total: number }> {
    const { search, status, page = 1, limit = 10 } = options;

    const where: Prisma.OrderWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { client: { contains: search, mode: "insensitive" } },
        { todo: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "All") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findById(id: string, userId: string): Promise<Order | null> {
    return prisma.order.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async create(data: {
    userId: string;
    orderNumber: string;
    client: string;
    todo: string;
    price: number;
    description?: string;
    status?: string;
  }): Promise<Order> {
    return prisma.order.create({
      data,
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      client?: string;
      todo?: string;
      price?: number;
      status?: string;
      description?: string;
    }
  ): Promise<Order | null> {
    const order = await this.findById(id, userId);
    if (!order) return null;

    return prisma.order.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const order = await this.findById(id, userId);
    if (!order) return false;

    await prisma.order.delete({
      where: { id },
    });

    return true;
  }

  async countByStatus(userId: string): Promise<Record<string, number>> {
    const statuses = ["Pending", "On Progress", "Revision", "Completed", "Cancelled"];

    const counts = await Promise.all(
      statuses.map((status) =>
        prisma.order.count({
          where: { userId, status },
        })
      )
    );

    return statuses.reduce((acc, status, index) => {
      acc[status] = counts[index];
      return acc;
    }, {} as Record<string, number>);
  }

  async findAllByUserId(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const orderRepository = new OrderRepository();
