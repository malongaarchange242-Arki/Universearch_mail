const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

export const createMailer = () => {
  // Lazy require so the service can compile even before local npm install is done.
  // The dependency is still required at runtime for actual email sending.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require('nodemailer');

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE, false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // In development, allow placeholder credentials and use mock transporter
  if (!host || !user || !pass) {
    if (isDevelopment) {
      console.warn('⚠️  Development mode: Using mock email transporter');
      console.warn('   Emails will be logged but NOT sent');
      console.warn('   For production, set SMTP_HOST, SMTP_USER, SMTP_PASS');
      
      // Return mock transporter for development
      return {
        sendMail: async (mailOptions: any) => {
          console.log('\n📧 [MOCK EMAIL - DEV MODE]');
          console.log(`   To: ${mailOptions.to}`);
          console.log(`   Subject: ${mailOptions.subject}`);
          if (mailOptions.attachments?.length) {
            console.log(`   Attachments: ${mailOptions.attachments.length} file(s)`);
          }
          console.log(`   Time: ${new Date().toISOString()}`);
          console.log('   Status: Would be sent in production\n');
          
          return {
            messageId: `mock-${Date.now()}@dev.local`,
            response: 'Mock send - development mode only',
          };
        },
      };
    } else {
      throw new Error('Missing SMTP configuration in environment variables');
    }
  }

  // Production mode: use real SMTP
  // Add tls: { rejectUnauthorized: false } for Gmail compatibility
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Required for Gmail and some SMTP servers
    },
  });
};
