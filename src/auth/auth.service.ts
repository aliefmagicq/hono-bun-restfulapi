import { Context } from 'hono';
import { Resend } from 'resend';
import { emailTemplate } from '../emails/email-template';

import db from '../lib/db';
import { appConfig } from '../config';

export const findUserByEmail = async (email: string) => {
  const findUser = await db.users.findFirst({
    where: { email },
  });

  if (!findUser) return null;
  return findUser;
};

export const findUserById = async (id: string) => {
  const findUser = await db.users.findUnique({
    where: { id },
  });

  if (!findUser) return null;
  return findUser;
};

type SendEmailVerification = {
  c: Context;
  to: string;
  verificationToken: string;
  emailToVerify: string;
};

export const sendEmailVerification = async ({
  c,
  to,
  verificationToken,
  emailToVerify,
}: SendEmailVerification) => {
  const resend = new Resend(c.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'Alief Khairul <onboarding@resend.dev>',
    to: [emailToVerify],
    subject: 'Verification Email',
    html: emailTemplate(
      to,
      `http://${appConfig.host}:${appConfig.port}/api/auth/verify-user?token=${verificationToken}&email=${emailToVerify}`
    ),
  });

  if (error) return { ok: false, message: 'failed-send-email' };
  return { ok: true, message: 'success-send-email', data };
};
