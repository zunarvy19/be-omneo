import { z } from "zod";

const statusEnum = z.enum([
  "Pending",
  "On Progress",
  "Revision",
  "Completed",
  "Cancelled",
]);

export const createOrderSchema = z.object({
  client: z.string().min(1, "Client is required").max(100),
  todo: z.string().min(1, "To Do is required").max(255),
  price: z.number().positive("Price must be greater than 0"),
  description: z.string().optional(),
});

export const updateOrderSchema = z.object({
  client: z.string().min(1, "Client is required").max(100).optional(),
  todo: z.string().min(1, "To Do is required").max(255).optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
  status: statusEnum.optional(),
  description: z.string().optional(),
});

export const orderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
