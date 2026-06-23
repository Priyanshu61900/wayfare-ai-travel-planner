import jwt from "jsonwebtoken";
import { config } from "../config.js";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const signAuthToken = (userId: string) =>
  jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });

export const verifyAuthToken = (token: string) => {
  const payload = jwt.verify(token, config.JWT_SECRET);
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return payload.sub;
};

export const authCookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production" || config.COOKIE_SECURE,
  sameSite: "lax" as const,
  maxAge: TOKEN_TTL_SECONDS * 1000,
  path: "/"
};

