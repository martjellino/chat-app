import { Elysia, t } from "elysia";
import { sessionMiddleware } from "../middleware/session-middleware";
import { conversationService } from "../../application/instance";

type ConversationType = 'DIRECT' | 'GROUP';

export const conversationRouter = new Elysia()
    .derive(sessionMiddleware)
    .get(
        "/conversations",
        async ({ user }) => {
            return await conversationService.getAllUserConversations(user.id);
        },
        {
            tags: ["conversations"],
        }
    )
    .get(
        "/conversations/:conversationId",
        async ({ params, user }) => {
            return await conversationService.getConversationById(params.conversationId, user.id);
        },
        {
            tags: ["conversations"],
        }
    )
    .post(
        "/conversations",
        async ({ body, user }) => {
            // Type assertion approach
            const conversationData = {
                ...body,
                createdBy: user.id,
                type: body.type as ConversationType
            };

            return await conversationService.createConversation(conversationData);
        },
        {
            tags: ["conversations"],
            body: t.Object({
                type: t.Union([t.Literal('DIRECT'), t.Literal('GROUP')]), // More specific type
                name: t.Optional(t.String()),
                participantIds: t.Array(t.String()),
            }),
        }
    )
    .put(
        "/conversations/:conversationId/participants",
        async ({ params, body, user }) => {
            return await conversationService.addParticipants(params.conversationId, body.participantIds, user.id);
        },
        {
            tags: ["conversations"],
            body: t.Object({
                participantIds: t.Array(t.String()),
            }),
        }
    )
    .delete(
        "/conversations/:conversationId/participants/:participantId",
        async ({ params, user }) => {
            await conversationService.removeParticipant(params.conversationId, params.participantId, user.id);
            return { message: "Participant removed successfully" };
        },
        {
            tags: ["conversations"],
        }
    );
