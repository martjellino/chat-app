import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/types";
import { MessageRepository } from "../../infrastructure/repositories/message";
import { MessageReadRepository } from "../../infrastructure/repositories/message-read";

@injectable()
export class MessageService {
  private messageRepo: MessageRepository;
  private messageReadRepo: MessageReadRepository;

  constructor(
    @inject(TYPES.messageRepo) messageRepo: MessageRepository,
    @inject(TYPES.messageReadRepo) messageReadRepo: MessageReadRepository
  ) {
    this.messageRepo = messageRepo;
    this.messageReadRepo = messageReadRepo;
  }

  public async getMessages(conversationId: string, userId: string, limit?: number, before?: Date) {
    return await this.messageRepo.getByConversation(conversationId, limit, before);
  }

  public async sendMessage(data: { content: string; senderId: string; conversationId: string }) {
    return await this.messageRepo.create(data);
  }

  public async updateMessage(id: string, content: string, userId: string) {
    const message = await this.messageRepo.update(id, content);
    if (message.senderId !== userId) {
      throw new Error("Not authorized to edit this message");
    }
    return message;
  }

  public async deleteMessage(id: string, userId: string) {
    const message = await this.messageRepo.markAsDeleted(id);
    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }
    return message;
  }

  public async markAsRead(messageId: string, userId: string) {
    const existing = await this.messageReadRepo.findByMessageAndUser(messageId, userId);
    if (!existing) {
      await this.messageReadRepo.create({
        messageId,
        userId
      });
    }
  }
}