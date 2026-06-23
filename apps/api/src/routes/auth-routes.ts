import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../lib/async-handler.js";
import { authCookieOptions, signAuthToken } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { loginSchema, registerSchema } from "../schemas.js";
import type { Store } from "../store/store.js";

const publicUser = (user: { id: string; name: string; email: string; createdAt: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

export const authRoutes = (store: Store) => {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many attempts. Try again shortly." } }
  });

  router.post(
    "/register",
    limiter,
    asyncHandler(async (req, res) => {
      const input = registerSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await store.createUser({
        name: input.name,
        email: input.email,
        passwordHash
      });
      res.cookie("wayfare_session", signAuthToken(user.id), authCookieOptions);
      res.status(201).json({ user: publicUser(user) });
    })
  );

  router.post(
    "/login",
    limiter,
    asyncHandler(async (req, res) => {
      const input = loginSchema.parse(req.body);
      const user = await store.findUserByEmail(input.email);
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }
      res.cookie("wayfare_session", signAuthToken(user.id), authCookieOptions);
      res.json({ user: publicUser(user) });
    })
  );

  router.post("/logout", (_req, res) => {
    res.clearCookie("wayfare_session", { ...authCookieOptions, maxAge: undefined });
    res.status(204).send();
  });

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const user = await store.findUserById(req.userId!);
      if (!user) throw new AppError(401, "USER_NOT_FOUND", "Account no longer exists.");
      res.json({ user: publicUser(user) });
    })
  );

  return router;
};

