import { FastifyInstance } from 'fastify';
import { recommendationMailRoutes } from './modules/recommendation-mails/recommendation-mails.routes';
import { registerEtablissementsRoutes } from './modules/etablissements/etablissements.routes';

export const registerRoutes = (app: FastifyInstance) => {
  app.register(recommendationMailRoutes, { prefix: '/api/mail' });
  app.register(registerEtablissementsRoutes);
};
