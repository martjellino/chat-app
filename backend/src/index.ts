import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRouter } from "./presentation/router/auth-router";
import { conversationRouter } from "./presentation/router/conversation-router";
import { messageRouter } from "./presentation/router/message-router";
import { contactRouter } from "./presentation/router/contact-router";


const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Chat API Documentation',
        version: '1.0.0',
        description: 'API documentation for the chat application'
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'conversations', description: 'Conversation management' },
        { name: 'messages', description: 'Message operations' },
        { name: 'contacts', description: 'Contact management' }
      ]
    }
  }))
  .use(authRouter)
  .use(conversationRouter)
  .use(messageRouter)
  .use(contactRouter)
  .listen(7000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);