import { Container } from "inversify";
import { WebSocketService } from "./services/websocket-service";
import { LoggerDev } from "../infrastructure/logger/logger.dev";
import { LoggerProd } from "../infrastructure/logger/logger.prod";
import { TYPES } from "../infrastructure/types";

// Import repositories
import { UserRepository } from "../infrastructure/repositories/user";
import { SessionRepository } from "../infrastructure/repositories/session";
import { ConversationRepository } from "../infrastructure/repositories/conversation";
import { MessageRepository } from "../infrastructure/repositories/message";
import { ContactRepository } from "../infrastructure/repositories/contact";
import { ParticipantRepository } from "../infrastructure/repositories/participant";

// Import services
import { UserService } from "./services/user-service";
import { AuthService } from "./services/auth-service";
import { ConversationService } from "./services/conversation-service";
import { MessageService } from "./services/message-service";
import { ContactService } from "./services/contact-service";
import { MessageReadRepository } from "../infrastructure/repositories/message-read";

// Import services
// import { AuthService } from "./services/auth-service";
// import { UserService } from "./services/user-service";
// import { ConversationService } from "./services/conversation-service";
// import { MessageService } from "./services/message-service";
// import { ContactService } from "./services/contact-service";


// Create container
export const container = new Container();

// Bind logger based on environment
if (process.env.NODE_ENV === "development") {
  container.bind(TYPES.logger).to(LoggerDev);
} else {
  container.bind(TYPES.logger).to(LoggerProd);
}

// Bind repositories
container.bind(TYPES.userRepo).to(UserRepository);
container.bind(TYPES.sessionRepo).to(SessionRepository);
container.bind(TYPES.conversationRepo).to(ConversationRepository);
container.bind(TYPES.messageRepo).to(MessageRepository);
container.bind(TYPES.contactRepo).to(ContactRepository);
container.bind(TYPES.participantRepo).to(ParticipantRepository);
container.bind(TYPES.messageReadRepo).to(MessageReadRepository);

// Bind services
container.bind(UserService).toSelf();
container.bind(AuthService).toSelf();
container.bind(ConversationService).toSelf();
container.bind(MessageService).toSelf();
container.bind(ContactService).toSelf();

// Export service instances
export const authService = container.get<AuthService>(AuthService);
export const userService = container.get<UserService>(UserService);
export const conversationService = container.get<ConversationService>(ConversationService);
export const messageService = container.get<MessageService>(MessageService);
export const contactService = container.get<ContactService>(ContactService);

// Optional: Export a WebSocket service if you want to handle real-time chat

container.bind(WebSocketService).toSelf();
export const webSocketService = container.get<WebSocketService>(WebSocketService);