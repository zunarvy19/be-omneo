import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { config } from "../config";
import { AppError } from "../utils/AppError";

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { message: "Register successful" };
  }

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return { token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

export const authService = new AuthService();
