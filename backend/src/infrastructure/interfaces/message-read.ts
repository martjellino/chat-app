import { MessageRead } from "@prisma/client";

export interface IMessageRead {
  create(data: { messageId: string; userId: string }): Promise<MessageRead>;
  findByMessageAndUser(messageId: string, userId: string): Promise<MessageRead | null>;
  findByMessage(messageId: string): Promise<MessageRead[]>;
  deleteByMessage(messageId: string): Promise<void>;
}