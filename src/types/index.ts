export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface JwtPayload {
  userId: string;
}

export interface RequestWithUser extends Express.Request {
  userId?: string;
}
