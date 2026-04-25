import 'dotenv/config';
import { app } from './app';

const PORT = parseInt(process.env.PORT || '3010', 10);
const HOST = '0.0.0.0';

process.on('unhandledRejection', (reason, promise) => {
  app.log.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  app.log.error(error, 'Uncaught Exception');
  process.exit(1);
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Mail service listening on http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
