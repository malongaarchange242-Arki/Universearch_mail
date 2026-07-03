const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const getEnv = (names: string[], fallback?: string): string | undefined => {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value !== '') return value;
  }
  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const createMailer = () => {
  // Lazy require so the service can compile even before local npm install is done.
  // The dependency is still required at runtime for actual email sending.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require('nodemailer');

  const host = getEnv(['SMTP_HOST', 'EMAIL_SMTP_HOST']);
  const port = parseNumber(getEnv(['SMTP_PORT', 'EMAIL_SMTP_PORT']), 587);
  const secure = parseBoolean(getEnv(['SMTP_SECURE', 'EMAIL_SMTP_SECURE']), port === 465);
  const user = getEnv(['SMTP_USER', 'EMAIL_SMTP_USER']);
  const pass = getEnv(['SMTP_PASS', 'EMAIL_SMTP_PASS']);
  const from = getEnv(['SMTP_FROM', 'EMAIL_FROM'], 'Universearch <no-reply@universearch.com>');
  const connectionTimeout = parseNumber(getEnv(['SMTP_CONNECTION_TIMEOUT', 'EMAIL_SMTP_CONNECTION_TIMEOUT']), 60000);
  const greetingTimeout = parseNumber(getEnv(['SMTP_GREETING_TIMEOUT', 'EMAIL_SMTP_GREETING_TIMEOUT']), 60000);
  const socketTimeout = parseNumber(getEnv(['SMTP_SOCKET_TIMEOUT', 'EMAIL_SMTP_SOCKET_TIMEOUT']), 60000);
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

  console.log(`📧 SMTP transporter configured: ${host}:${port} secure=${secure} timeouts=${connectionTimeout}/${greetingTimeout}/${socketTimeout}ms`);

  const buildTransportOptions = (smtpPort: number, smtpSecure: boolean) => ({
    host,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user,
      pass,
    },
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    requireTLS: parseBoolean(getEnv(['SMTP_REQUIRE_TLS', 'EMAIL_SMTP_REQUIRE_TLS']), true),
    tls: {
      rejectUnauthorized: false, // Required for Gmail and some SMTP servers
    },
  });

  const transportOptionsList = [
    buildTransportOptions(port, secure),
    buildTransportOptions(port === 465 ? 587 : 465, port === 465 ? false : true),
  ].filter((option, index, options) => options.findIndex((candidate) => candidate.port === option.port && candidate.secure === option.secure) === index);

  let cachedTransport: any | null = null;

  const getWorkingTransport = async () => {
    if (cachedTransport) return cachedTransport;

    let lastError: unknown;
    for (const transportOptions of transportOptionsList) {
      const transporter = nodemailer.createTransport(transportOptions);
      try {
        await transporter.verify();
        cachedTransport = transporter;
        console.log(`📧 SMTP connection verified via ${transportOptions.host}:${transportOptions.port} secure=${transportOptions.secure}`);
        return transporter;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ SMTP verification failed for ${transportOptions.host}:${transportOptions.port} secure=${transportOptions.secure}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw lastError instanceof Error ? lastError : new Error('SMTP verification failed');
  };

  // Production mode: use real SMTP
  return {
    sendMail: async (mailOptions: any) => {
      const transporter = await getWorkingTransport();
      return transporter.sendMail(mailOptions);
    },
  };
};
