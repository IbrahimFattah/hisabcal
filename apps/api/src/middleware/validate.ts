import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    request.body = schema.parse(request.body);
  };
}
