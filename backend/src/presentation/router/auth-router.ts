import { Elysia, t } from "elysia";
import { authService } from "../../application/instance";
import { InsertUser } from "../../infrastructure/interfaces/user";

export const authRouter = new Elysia()
  // router
  .post(
    "/register",
    async ({ body, set }) => {
      const { name, email, password } = body;
      const insertUser: InsertUser = {
        name,
        email,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: '',
        status: 'active'
      };
      set.status = 201;
      return await authService.registerUser(insertUser);
    }, {
    tags: ["auth"],
    body: t.Object({
      email: t.String(),
      password: t.String(),
      name: t.String(),
    }),
  }
  )

  .post(
    "/login",
    async ({ body, set, cookie: { session } }) => {
      const { user, session: newSession } = await authService.loginUser(body.email, body.password);

      session.set({
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        value: newSession.id,
      });

      set.status = 200;

      return {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    },
    {
      tags: ["auth"],
      body: t.Object({
        email: t.String({ minLength: 1, format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .post(
    "/logout",
    async ({ set, cookie: { session } }) => {
      const sessionId = session?.value;

      if (!sessionId) {
        set.status = 400;
        throw new Error("You are not logged in");
      }

      await authService.logoutUser(sessionId);

      session.remove();
      return { message: "Logout successful" };
    },
    {
      tags: ["auth"],
    }
  );