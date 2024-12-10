import { Elysia, t } from "elysia";
import { messageService } from "../../application/instance";
import { sessionMiddleware } from "../middleware/session-middleware";

export const messageRouter = new Elysia()
    .derive(sessionMiddleware)
    .get(
        "/conversations/:conversationId/messages",
        async ({ params, user, query }) => {
            const limit = query.limit ? parseInt(query.limit) : 50;
            const before = query.before ? new Date(query.before) : undefined;
            return await messageService.getMessages(params.conversationId, user.id, limit, before);
        },
        {
            tags: ["messages"],
        }
    )
    .post(
        "/conversations/:conversationId/messages",
        async ({ params, body, user }) => {
            return await messageService.sendMessage({
                ...body,
                conversationId: params.conversationId,
                senderId: user.id,
            });
        },
        {
            tags: ["messages"],
            body: t.Object({
                content: t.String({ minLength: 1 }),
            }),
        }
    )
    .put(
        "/messages/:messageId",
        async ({ params, body, user }) => {
            return await messageService.updateMessage(params.messageId, body.content, user.id);
        },
        {
            tags: ["messages"],
            body: t.Object({
                content: t.String({ minLength: 1 }),
            }),
        }
    )
    .delete(
        "/messages/:messageId",
        async ({ params, user }) => {
            await messageService.deleteMessage(params.messageId, user.id);
            return { message: "Message deleted successfully" };
        },
        {
            tags: ["messages"],
        }
    );