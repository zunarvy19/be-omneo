import { APIRequestContext, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export interface AuthResponse {
  token: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  client: string;
  todo: string;
  price: number;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export class ApiHelper {
  public readonly request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(data: { name: string; email: string; password: string }) {
    const response = await this.request.post(`${BASE_URL}/api/auth/register`, {
      data,
      headers: this.getHeaders(),
    });
    return response;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request.post(`${BASE_URL}/api/auth/login`, {
      data,
      headers: this.getHeaders(),
    });
    const body = await response.json();
    this.token = body.data.token;
    return body.data;
  }

  async getProfile(): Promise<UserResponse> {
    const response = await this.request.get(`${BASE_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    const body = await response.json();
    return body.data;
  }

  async getOrders(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<OrderResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const url = `${BASE_URL}/api/orders${queryString ? `?${queryString}` : ""}`;

    const response = await this.request.get(url, {
      headers: this.getHeaders(),
    });
    const body = await response.json();
    return body;
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    const response = await this.request.get(`${BASE_URL}/api/orders/${id}`, {
      headers: this.getHeaders(),
    });
    const body = await response.json();
    return body.data;
  }

  async createOrder(data: {
    client: string;
    todo: string;
    price: number;
    description?: string;
  }) {
    const response = await this.request.post(`${BASE_URL}/api/orders`, {
      data,
      headers: this.getHeaders(),
    });
    return response;
  }

  async updateOrder(
    id: string,
    data: {
      client?: string;
      todo?: string;
      price?: number;
      status?: string;
      description?: string;
    }
  ) {
    const response = await this.request.put(`${BASE_URL}/api/orders/${id}`, {
      data,
      headers: this.getHeaders(),
    });
    return response;
  }

  async deleteOrder(id: string) {
    const response = await this.request.delete(`${BASE_URL}/api/orders/${id}`, {
      headers: this.getHeaders(),
    });
    return response;
  }

  async getDashboardStats() {
    const response = await this.request.get(`${BASE_URL}/api/orders/dashboard`, {
      headers: this.getHeaders(),
    });
    const body = await response.json();
    return body.data;
  }
}
