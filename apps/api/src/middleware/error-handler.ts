import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.path} was not found.`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  void _next;
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the highlighted fields.",
        details: error.flatten()
      }
    });
    return;
  }

  const known = error instanceof AppError;
  const status = known ? error.status : 500;
  if (!known) req.log?.error({ err: error }, "Unhandled request error");
  res.status(status).json({
    error: {
      code: known ? error.code : "INTERNAL_ERROR",
      message: known ? error.message : "Something went wrong. Please try again.",
      ...(known && error.details ? { details: error.details } : {})
    }
  });
};
