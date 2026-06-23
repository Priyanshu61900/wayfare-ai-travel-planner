import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.wayfare_session;
    if (!token) throw new AppError(401, "AUTH_REQUIRED", "Please sign in to continue.");
    req.userId = verifyAuthToken(token);
    next();
  } catch {
    next(new AppError(401, "INVALID_SESSION", "Your session has expired. Please sign in again."));
  }
};

