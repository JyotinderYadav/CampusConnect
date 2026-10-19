import { ZodError } from "zod";
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProd = process.env.NODE_ENV === 'production';

  // Prisma errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation error: " + err.errors.map(e => e.message).join(", "),
      details: err.errors,
    });
    return;
  }

  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this value already exists',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Record not found',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (!isProd) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 && isProd ? 'Internal server error' : message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

export function createError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}
