import prisma from "../config/prisma";

export async function generateOrderNumber(): Promise<string> {
  const lastOrder = await prisma.order.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      orderNumber: true,
    },
  });

  if (!lastOrder) {
    return "ORD-0001";
  }

  const lastNumber = parseInt(lastOrder.orderNumber.replace("ORD-", ""), 10);
  const nextNumber = lastNumber + 1;

  return `ORD-${nextNumber.toString().padStart(4, "0")}`;
}
