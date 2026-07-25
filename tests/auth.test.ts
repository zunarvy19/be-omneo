import { test, expect } from "@playwright/test";
import { ApiHelper } from "./helpers/api";
import { testUsers } from "./helpers/test-data";

let api: ApiHelper;

test.beforeEach(async ({ request }) => {
  api = new ApiHelper(request);
});

test.describe("Auth API", () => {
  test.describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
      const response = await api.register(testUsers.valid);

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.message).toBe("Register successful");
    });

    test("should return error for duplicate email", async () => {
      await api.register(testUsers.valid);
      const response = await api.register(testUsers.valid);

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Email already exists");
    });

    test("should return error for invalid email format", async () => {
      const response = await api.register(testUsers.invalidEmail);

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toContain("Invalid email");
    });

    test("should return error for short password", async () => {
      const response = await api.register(testUsers.shortPassword);

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toContain("at least 8 characters");
    });

    test("should return error for missing required fields", async () => {
      const response = await api.register({ name: "", email: "", password: "" });

      expect(response.status()).toBe(400);
    });
  });

  test.describe("POST /api/auth/login", () => {
    test.beforeEach(async () => {
      await api.register(testUsers.valid);
    });

    test("should login successfully with valid credentials", async () => {
      const response = await api.login({
        email: testUsers.valid.email,
        password: testUsers.valid.password,
      });

      expect(response.token).toBeDefined();
      expect(typeof response.token).toBe("string");
    });

    test("should return error for invalid email", async () => {
      const response = await api.request.post("/api/auth/login", {
        data: {
          email: "nonexistent@example.com",
          password: testUsers.valid.password,
        },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid email or password");
    });

    test("should return error for invalid password", async () => {
      const response = await api.request.post("/api/auth/login", {
        data: {
          email: testUsers.valid.email,
          password: "wrongpassword",
        },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid email or password");
    });
  });

  test.describe("GET /api/auth/me", () => {
    test.beforeEach(async () => {
      await api.register(testUsers.valid);
      await api.login({
        email: testUsers.valid.email,
        password: testUsers.valid.password,
      });
    });

    test("should return user profile", async () => {
      const profile = await api.getProfile();

      expect(profile.id).toBeDefined();
      expect(profile.name).toBe(testUsers.valid.name);
      expect(profile.email).toBe(testUsers.valid.email);
    });

    test("should return 401 without token", async ({ request }) => {
      const response = await request.get("/api/auth/me");

      expect(response.status()).toBe(401);
    });

    test("should return 401 with invalid token", async ({ request }) => {
      const response = await request.get("/api/auth/me", {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      expect(response.status()).toBe(401);
    });
  });
});
