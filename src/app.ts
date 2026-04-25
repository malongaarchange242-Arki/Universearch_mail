import Fastify, { FastifyError, FastifyInstance } from 'fastify';
import { createSupabaseClient } from './config/supabase';
import { registerRoutes } from './routes';

export const app: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  bodyLimit: 10 * 1024 * 1024,
});

app.addHook('onRequest', (request, reply, done) => {
  (request as any).startTime = process.hrtime.bigint();

  const origin = process.env.CORS_ORIGIN || '*';
  reply.header('Access-Control-Allow-Origin', origin);
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  reply.header('Access-Control-Allow-Credentials', 'true');

  if (request.method === 'OPTIONS') {
    reply.status(204).send();
    return;
  }

  done();
});

app.decorate('supabase', createSupabaseClient());
app.decorate('mailer', null);

app.addHook('onResponse', (request, reply) => {
  const start = (request as any).startTime;
  if (!start) return;

  const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

  app.log.info({
    endpoint: `${request.method} ${request.url}`,
    status: reply.statusCode,
    duration_ms: duration.toFixed(2),
    ip: request.ip,
  });
});

app.get('/health', async () => ({
  service: 'mail-service',
  status: 'ok',
  time: new Date().toISOString(),
}));

registerRoutes(app);

app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error);
  reply.status(error.statusCode ?? 500).send({
    success: false,
    error: error.message ?? 'Internal Server Error',
  });
});
