import { Context, Next } from 'hono';
import { signInSchema, signUpSchema } from '../schemas/auth.schema';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { authConfig } from '../config';
import SendResponse from '../utils/response';

class AuthMiddleware {
  static signUp = async (c: Context, next: Next) => {
    try {
      const body = await c.req.parseBody();
      const isValid = signUpSchema.safeParse({ ...body });

      if (!isValid.success) {
        throw new Error('Please complete your personal details.');
      }

      await next();
    } catch (e) {
      if (e instanceof Error) {
        return SendResponse.error(c, null, e);
      }
    }
  };

  static signIn = async (c: Context, next: Next) => {
    try {
      const body = await c.req.parseBody();
      const isValid = signInSchema.safeParse({ ...body });

      if (!isValid.success) {
        throw new Error('Please complete your personal details.');
      }

      await next();
    } catch (e) {
      if (e instanceof Error) {
        return SendResponse.error(c, null, e);
      }
    }
  };

  static getUser = async (c: Context, next: Next) => {
    try {
      const cookie = getCookie(c, 'access_token');
      const refreshCookie = getCookie(c, 'refresh_token');

      if (!cookie || cookie === undefined) throw new Error('user not found');

      const decodedToken = await verify(cookie, authConfig.secret);
      const tokenExpired = decodedToken.exp as number;
      if (tokenExpired < Date.now() || tokenExpired === Date.now()) {
        throw new Error('user not found, token expired');
      }

      c.set('userId', decodedToken.userId as string);
      await next();
    } catch (e) {
      if (e instanceof Error) {
        return SendResponse.error(c, null, e);
      }
    }
  };
}

export default AuthMiddleware;
