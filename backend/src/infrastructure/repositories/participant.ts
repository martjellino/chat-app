import "reflect-metadata";
import { Participant, PrismaClient } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { IParticipant } from "../interfaces/participant";
// import { IParticipant } from "../infrastructure/interfaces/participant";
// import { prisma } from "../infrastructure/utils/prisma";


@injectable()
export class ParticipantRepository implements IParticipant {
  getByConversationId(id: string) {
      throw new Error("Method not implemented.");
  }
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }

  async findByConversation(conversationId: string): Promise<Participant[]> {
    return await this.prisma.participant.findMany({
      where: {
        conversationId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  }

  async findByUserAndConversation(userId: string, conversationId: string): Promise<Participant | null> {
    return await this.prisma.participant.findFirst({
      where: {
        userId,
        conversationId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  }

  async create(data: { userId: string; conversationId: string; role: string }): Promise<Participant> {
    return await this.prisma.participant.create({
      data: {
        userId: data.userId,
        conversationId: data.conversationId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  }

  async updateRole(id: string, role: string): Promise<Participant> {
    return await this.prisma.participant.update({
      where: { id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  }

  async markAsLeft(id: string): Promise<Participant> {
    return await this.prisma.participant.update({
      where: { id },
      data: {
        leftAt: new Date(),
      },
    });
  }
}
