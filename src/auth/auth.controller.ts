import { Context, Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { authConfig } from '../config';
import db from '../lib/db';
import SendResponse from '../utils/response';
import AuthMiddleware from './auth.middleware';
import { findUserByEmail, findUserById } from './auth.service';

class AuthController {
  public route: Hono;

  constructor() {
    this.route = new Hono();
    this.signUp('/sign-up');
    this.signIn('/sign-in');
    this.getUser('/get-user');
  }

  signUp = (path: string) => {
    return this.route.post(path, AuthMiddleware.signUp, async (c) => {
      try {
        const body = await c.req.parseBody();
        const newUser = {
          name: body.name as string,
          email: body.email as string,
          password: body.password as string,
        };

        const findUser = await findUserByEmail(newUser.email);
        if (findUser) throw new Error('email has use by another user');

        const hashedPassword = await Bun.password.hash(newUser.password);
        const createUser = await db.users.create({
          data: {
            ...newUser,
            password: hashedPassword,
            verifiedEmail: false,
          },
        });

        return SendResponse.success(c, createUser, createUser.name);
      } catch (e) {
        if (e instanceof Error) {
          return SendResponse.error(c, null, e);
        }
      }
    });
  };

  signIn = (path: string) => {
    return this.route.post(path, AuthMiddleware.signIn, async (c) => {
      try {
        const body = await c.req.parseBody();
        const user = {
          email: body.email as string,
          password: body.password as string,
        };

        const findUser = await findUserByEmail(user.email);
        if (!findUser) throw new Error('no user found');

        const comparePassword = {
          success: await Bun.password.verify(user.password, findUser.password),
        };
        if (!comparePassword.success) throw new Error('wrong password!');

        // CREATE ACCESS PAYLOAD
        const accessPayload = {
          userId: findUser.id,
          role: findUser.roles,
          exp: authConfig.secretExpIn,
        };

        // CREATE REFRESH PAYLOAD
        const refreshPayload = {
          userId: findUser.id,
          role: findUser.roles,
          exp: authConfig.secretRefreshExpIn,
        };

        // CREATE ACCESS_TOKEN JWT TOKEN
        const accessToken = await sign(accessPayload, authConfig.secret);

        // CREATE REFRESH_TOKEN JWT TOKEN
        const refreshToken = await sign(
          refreshPayload,
          authConfig.secretRefresh
        );

        // SET_COOKIE ACCESS_TOKEN
        setCookie(c, 'access_token', accessToken, {
          secure: Bun.env.NODE_ENV === 'production',
          httpOnly: true,
          expires: new Date(authConfig.secretExpIn),
          sameSite: 'Strict',
        });

        // SET_COOKIE REFRESH_TOKEN
        setCookie(c, 'refresh_token', refreshToken, {
          secure: Bun.env.NODE_ENV === 'production',
          httpOnly: true,
          expires: new Date(authConfig.secretRefreshExpIn),
          sameSite: 'Strict',
        });

        // SET REFRESH_TOKEN TO USER TABLE
        await db.users.update({
          where: { id: findUser.id },
          data: { verifiedEmail: true, refreshToken },
        });

        return SendResponse.success(
          c,
          { email: findUser.email, accessToken },
          'login successfully'
        );
      } catch (e) {
        if (e instanceof Error) {
          SendResponse.error(c, null, e);
        }
      }
    });
  };

  getUser = (path: string) => {
    return this.route.get(path, AuthMiddleware.getUser, async (c: Context) => {
      try {
        const userId = c.get('userId');
        const findUser = await findUserById(userId);
        if (!findUser) throw new Error('user not found');

        const user = {
          name: findUser.name as string,
          email: findUser.email as string,
          avatar: findUser.avatar as string,
          verifiedEmail: findUser.verifiedEmail as boolean,
          roles: findUser.roles as string,
          createdAt: findUser.createdAt as Date,
          updatedAt: findUser.updatedAt as Date,
        };

        return SendResponse.success(c, user, 'success get user');
      } catch (e) {
        if (e instanceof Error) {
          SendResponse.error(c, null, e);
        }
      }
    });
  };
}

export default new AuthController();
