import { test, expect } from "@playwright/test";
import { ApiHelper } from "./helpers/api";
import { testUsers, testOrders } from "./helpers/test-data";

let api: ApiHelper;

test.beforeEach(async ({ request }) => {
  api = new ApiHelper(request);
  await api.register(testUsers.valid);
  await api.login({
    email: testUsers.valid.email,
    password: testUsers.valid.password,
  });
});

test.describe("Orders API", () => {
  test.describe("POST /api/orders", () => {
    test("should create a new order successfully", async () => {
      const response = await api.createOrder(testOrders.first);

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.message).toBe("Order created successfully");
      expect(body.data.orderNumber).toMatch(/^ORD-\d{4}$/);
      expect(body.data.status).toBe("Pending");
    });

    test("should return error for missing client", async () => {
      const response = await api.createOrder({
        client: "",
        todo: testOrders.first.todo,
        price: testOrders.first.price,
      });

      expect(response.status()).toBe(400);
    });

    test("should return error for missing todo", async () => {
      const response = await api.createOrder({
        client: testOrders.first.client,
        todo: "",
        price: testOrders.first.price,
      });

      expect(response.status()).toBe(400);
    });

    test("should return error for zero price", async () => {
      const response = await api.createOrder({
        client: testOrders.first.client,
        todo: testOrders.first.todo,
        price: 0,
      });

      expect(response.status()).toBe(400);
    });

    test("should return error for negative price", async () => {
      const response = await api.createOrder({
        client: testOrders.first.client,
        todo: testOrders.first.todo,
        price: -1000,
      });

      expect(response.status()).toBe(400);
    });

    test("should return 401 without authentication", async ({ request }) => {
      const response = await request.post("/api/orders", {
        data: testOrders.first,
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe("GET /api/orders", () => {
    test.beforeEach(async () => {
      await api.createOrder(testOrders.first);
      await api.createOrder(testOrders.second);
      await api.createOrder(testOrders.third);
    });

    test("should return all orders with pagination", async () => {
      const result = await api.getOrders();

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(3);
      expect(result.data.length).toBe(3);
    });

    test("should filter orders by status", async () => {
      const result = await api.getOrders({ status: "Pending" });

      expect(result.data.length).toBe(3);
      result.data.forEach((order) => {
        expect(order.status).toBe("Pending");
      });
    });

    test("should search orders by client name", async () => {
      const result = await api.getOrders({ search: "PT Maju" });

      expect(result.data.length).toBe(1);
      expect(result.data[0].client).toBe("PT Maju Jaya");
    });

    test("should search orders by order number", async () => {
      const result = await api.getOrders({ search: "ORD-0001" });

      expect(result.data.length).toBe(1);
      expect(result.data[0].orderNumber).toBe("ORD-0001");
    });

    test("should paginate orders", async () => {
      const result = await api.getOrders({ page: 1, limit: 2 });

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(3);
    });
  });

  test.describe("GET /api/orders/:id", () => {
    test("should return order detail", async () => {
      const createResponse = await api.createOrder(testOrders.first);
      const createBody = await createResponse.json();
      const orderId = createBody.data.id;

      const order = await api.getOrderById(orderId);

      expect(order.id).toBe(orderId);
      expect(order.client).toBe(testOrders.first.client);
      expect(order.todo).toBe(testOrders.first.todo);
      expect(order.price).toBe(testOrders.first.price);
    });

    test("should return 404 for non-existent order", async () => {
      await expect(
        api.getOrderById("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow();
    });
  });

  test.describe("PUT /api/orders/:id", () => {
    test("should update order successfully", async () => {
      const createResponse = await api.createOrder(testOrders.first);
      const createBody = await createResponse.json();
      const orderId = createBody.data.id;

      const response = await api.updateOrder(orderId, testOrders.updated);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Order updated successfully");
    });

    test("should update only status", async () => {
      const createResponse = await api.createOrder(testOrders.first);
      const createBody = await createResponse.json();
      const orderId = createBody.data.id;

      const response = await api.updateOrder(orderId, { status: "On Progress" });

      expect(response.status()).toBe(200);
      const order = await api.getOrderById(orderId);
      expect(order.status).toBe("On Progress");
      expect(order.client).toBe(testOrders.first.client);
    });

    test("should return 404 for non-existent order", async () => {
      const response = await api.updateOrder(
        "00000000-0000-0000-0000-000000000000",
        testOrders.updated
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("DELETE /api/orders/:id", () => {
    test("should delete order successfully", async () => {
      const createResponse = await api.createOrder(testOrders.first);
      const createBody = await createResponse.json();
      const orderId = createBody.data.id;

      const response = await api.deleteOrder(orderId);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Order deleted successfully");
    });

    test("should return 404 for non-existent order", async () => {
      const response = await api.deleteOrder(
        "00000000-0000-0000-0000-000000000000"
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("GET /api/orders/dashboard", () => {
    test("should return dashboard stats", async () => {
      await api.createOrder(testOrders.first);
      await api.createOrder(testOrders.second);

      const stats = await api.getDashboardStats();

      expect(stats.totalOrders).toBe(2);
      expect(stats.pendingOrders).toBe(2);
      expect(stats.onProgressOrders).toBe(0);
      expect(stats.completedOrders).toBe(0);
    });

    test("should return zero stats for empty orders", async () => {
      const stats = await api.getDashboardStats();

      expect(stats.totalOrders).toBe(0);
      expect(stats.pendingOrders).toBe(0);
      expect(stats.onProgressOrders).toBe(0);
      expect(stats.completedOrders).toBe(0);
    });
  });

  test.describe("Authorization", () => {
    test("user should not access other user's orders", async () => {
      await api.createOrder(testOrders.first);

      await api.register(testUsers.another);
      await api.login({
        email: testUsers.another.email,
        password: testUsers.another.password,
      });

      const result = await api.getOrders();

      expect(result.data.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });
  });
});
