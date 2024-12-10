import { Elysia, t } from "elysia";
import { sessionMiddleware } from "../middleware/session-middleware";
import { contactService } from "../../application/instance";

export const contactRouter = new Elysia()
  .derive(sessionMiddleware)
  .get(
    "/contacts",
    async ({ user }) => {
      return await contactService.getAllContacts(user.id);
    },
    {
      tags: ["contacts"],
    }
  )
  .post(
    "/contacts",
    async ({ body, user }) => {
      return await contactService.addContactByEmail(user.id, body.email);
    },
    {
      body: t.Object({
        email: t.String(),
      }),
    }
  )
  .put(
    "/contacts/:contactId",
    async ({ params, body, user }) => {
      return await contactService.updateContactStatus(user.id, params.contactId, body.status);
    },
    {
      tags: ["contacts"],
      body: t.Object({
        status: t.String({ enum: ["PENDING", "ACCEPTED", "BLOCKED"] }),
      }),
    }
  )
  .delete(
    "/contacts/:contactId",
    async ({ params, user }) => {
      await contactService.removeContact(user.id, params.contactId);
      return { message: "Contact removed successfully" };
    },
    {
      tags: ["contacts"],
    }
  );