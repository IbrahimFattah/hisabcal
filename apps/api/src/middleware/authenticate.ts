import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from './errorHandler.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies?.token;

  if (!token) {
    throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    request.user = payload;
  } catch {
    throw new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
}
