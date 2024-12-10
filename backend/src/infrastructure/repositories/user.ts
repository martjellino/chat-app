import "reflect-metadata";

import { PrismaClient, User } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { InsertUser, IUser, UpdateUser } from "../interfaces/user";


@injectable()
export class UserRepository implements IUser {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async create(user: InsertUser): Promise<Omit<User, "password">> {
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
  async update(id: string, user: UpdateUser): Promise<Omit<User, "password">> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<User | null> {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}