import { FastifyInstance } from 'fastify';
import {
  sendRecommendationEmailSchema,
  SendRecommendationEmailPayload,
} from './recommendation-mails.schemas';
import { sendRecommendationEmails } from './recommendation-mails.service';

export const recommendationMailRoutes = async (app: FastifyInstance) => {
  app.post('/recommendations/send', async (request, reply) => {
    const parsed = sendRecommendationEmailSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      });
    }

    const payload: SendRecommendationEmailPayload = parsed.data;
    const delivery = await sendRecommendationEmails(app, payload);

    const sentCount = delivery.results.filter((item) => item.status === 'sent').length;
    const failedCount = delivery.results.filter((item) => item.status === 'failed').length;
    const skippedCount = delivery.results.filter((item) => item.status === 'skipped').length;

    return reply.send({
      success: failedCount === 0,
      summary: {
        requested: payload.institutions.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      },
      attachment_file_name: delivery.attachmentFileName,
      results: delivery.results,
    });
  });
};
