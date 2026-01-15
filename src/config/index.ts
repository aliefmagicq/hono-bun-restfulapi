export const authConfig = {
  secret: Bun.env.JWT_SECRET as string,
  secretRefresh: Bun.env.JWT_SECRET_REFRESH as string,

  secretExpIn: Date.now() + 1000 * 60 * 15,
  secretRefreshExpIn: Date.now() + 1000 * 60 * 60 * 24,

  verificationSecret: Bun.env.JWT_SECRET_EMAIL_VERIFICATION as string,
  verificationEmailSecretExpIn: Date.now() + 1000 * 60 * 24,
};

export const appConfig = {
  host: Bun.env.APP_HOST,
  port: Bun.env.APP_PORT,
};

export const mailtrapConfig = {
  token: Bun.env.MAILTRAP_API_KEY as string,
  recipientEmail: Bun.env.RECIPIENT_EMAIL as string,
  senderEmail: Bun.env.SENDER_EMAIL as string,
  replyToEmail: Bun.env.REPLY_TO_EMAIL as string,
};
