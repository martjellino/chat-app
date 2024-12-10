import "reflect-metadata";

import { PrismaClient, User } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { ISession } from "../interfaces/logger";


@injectable()
export class SessionRepository implements ISession {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getToken(tokenId: string) {
    return await this.prisma.session.findUnique({
      where: {
        id: tokenId,
      },
      include: {
        user: true,
      },
    });
  }

  public async createToken(user: User) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

    return await this.prisma.session.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        expiresAt: expiresAt,
      },
    });
  }

  public async deleteToken(tokenId: string) {
    return await this.prisma.session.delete({
      where: {
        id: tokenId,
      },
    });
  }
}