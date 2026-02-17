import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from '@calories-tracker/shared';
import { authService } from '../services/auth.service.js';
import { authenticate, generateToken } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/register', {
    preHandler: [validate(registerSchema)],
    handler: async (request, reply) => {
      const user = await authService.register(request.body as any);
      const token = generateToken({ userId: user.id, email: user.email });

      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return { user };
    },
  });

  app.post('/api/auth/login', {
    preHandler: [validate(loginSchema)],
    handler: async (request, reply) => {
      const user = await authService.login(request.body as any);
      const token = generateToken({ userId: user.id, email: user.email });

      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return { user };
    },
  });

  app.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { message: 'Logged out' };
  });

  app.get('/api/auth/me', {
    preHandler: [authenticate],
    handler: async (request) => {
      const user = await authService.getUser(request.user!.userId);
      return { user };
    },
  });
}
