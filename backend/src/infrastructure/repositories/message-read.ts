import "reflect-metadata";
import { MessageRead, PrismaClient } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { IMessageRead } from "../interfaces/message-read";
// import { IMessageRead } from "@/infrastructure/interfaces/message-read";
// import { prisma } from "@/infrastructure/utils/prisma";

@injectable()
export class MessageReadRepository implements IMessageRead {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }

  async create(data: { messageId: string; userId: string }): Promise<MessageRead> {
    return await this.prisma.messageRead.create({
      data: {
        messageId: data.messageId,
        userId: data.userId,
      },
    });
  }

  async findByMessageAndUser(messageId: string, userId: string): Promise<MessageRead | null> {
    return await this.prisma.messageRead.findFirst({
      where: {
        messageId,
        userId,
      },
    });
  }

  async findByMessage(messageId: string): Promise<MessageRead[]> {
    return await this.prisma.messageRead.findMany({
      where: {
        messageId,
      },
      include: {
        message: true,
      },
    });
  }

  async deleteByMessage(messageId: string): Promise<void> {
    await this.prisma.messageRead.deleteMany({
      where: {
        messageId,
      },
    });
  }
}