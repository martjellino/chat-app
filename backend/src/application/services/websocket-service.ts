// src/applications/services/websocket-service.ts
import "reflect-metadata";
import { inject, injectable } from "inversify";
import { MessageService } from "./message-service";
import { TYPES } from "../../infrastructure/types";

@injectable()
export class WebSocketService {
  private messageService: MessageService;
  private connections: Map<string, WebSocket> = new Map();

  constructor(
    @inject(MessageService) messageService: MessageService
  ) {
    this.messageService = messageService;
  }

  public handleConnection(userId: string, ws: WebSocket) {
    this.connections.set(userId, ws);

    ws.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        
        switch (data.type) {
          case "message":
            const message = await this.messageService.sendMessage({
              content: data.content,
              senderId: userId,
              conversationId: data.conversationId
            });
            
            // Broadcast to all participants
            this.broadcastToConversation(message.conversationId, {
              type: "new_message",
              message
            });
            break;

          case "typing":
            this.broadcastToConversation(data.conversationId, {
              type: "typing",
              userId,
              conversationId: data.conversationId
            });
            break;
        }
      } catch (error) {
        if (error instanceof Error) {
          ws.send(JSON.stringify({
            type: "error",
            message: error.message
          }));
        } else {
          ws.send(JSON.stringify({
            type: "error",
            message: "An unknown error occurred"
          }));
        }
      }
    });
    ws.addEventListener("close", () => {
      this.connections.delete(userId);
    });
  }

  private broadcastToConversation(conversationId: string, data: any) {
    // In a real implementation, you'd get the participant list from the conversation
    // and send the message only to those users
    this.connections.forEach((ws) => {
      ws.send(JSON.stringify(data));
    });
  }

  public sendToUser(userId: string, data: any) {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.send(JSON.stringify(data));
    }
  }
}