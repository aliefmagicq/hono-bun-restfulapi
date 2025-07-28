import { Context, Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { appConfig, authConfig } from '../config';
import db from '../lib/db';
import SendResponse from '../utils/response';
import AuthMiddleware from './auth.middleware';
import {
  findUserByEmail,
  findUserById,
  sendEmailVerification,
} from './auth.service';

type Bindings = {
  RESEND_API_KEY: string;
};

class AuthController {
  public route: Hono<{ Bindings: Bindings }>;

  constructor() {
    this.route = new Hono<{ Bindings: Bindings }>();
    this.signUp('/sign-up');
    this.signIn('/sign-in');
    this.getUser('/get-user');
    this.verifyUser('/verify-user');
    this.verifySuccess('/verification-success');
  }

  private signUp = (path: string) => {
    return this.route.post(path, AuthMiddleware.signUp, async (c) => {
      try {
        const body = await c.req.parseBody();
        const newUser = {
          name: body.name as string,
          email: body.email as string,
          password: body.password as string,
        };

        // FIND USER FIRST
        const findUser = await findUserByEmail(newUser.email);
        if (findUser) throw new Error('email has use by another user');

        // HASH THE PASSWORD & UPDATE THE USERS TABLE
        const hashedPassword = await Bun.password.hash(newUser.password);
        const createUser = await db.users.create({
          data: {
            ...newUser,
            password: hashedPassword,
            verifiedEmail: false,
          },
        });

        // CREATE VERIFICATION_TOKEN
        const verificationPayload = {
          userId: createUser.id,
          role: createUser.roles,
          exp: authConfig.verificationEmailSecretExpIn,
        };

        const verificationToken = await sign(
          verificationPayload,
          authConfig.verificationSecret
        );

        // SEND EMAIL VERIFICATION
        await sendEmailVerification({
          c,
          to: newUser.name,
          verificationToken,
          emailToVerify: newUser.email,
        });

        return SendResponse.success(c, createUser, 'create user success');
      } catch (e) {
        if (e instanceof Error) {
          return SendResponse.error(c, null, e.message);
        }
      }
    });
  };

  private signIn = (path: string) => {
    return this.route.post(path, AuthMiddleware.signIn, async (c) => {
      try {
        const body = await c.req.parseBody();
        const user = {
          email: body.email as string,
          password: body.password as string,
        };

        // FIND USER FIRST
        const findUser = await findUserByEmail(user.email);
        if (!findUser) throw new Error('no user found');

        // COMPARE TO ALREADY USER PASSWORD
        const comparePassword = {
          success: await Bun.password.verify(user.password, findUser.password),
        };
        if (!comparePassword.success) throw new Error('wrong password!');

        if (!findUser.verifiedEmail) {
          // CREATE VERIFICATION_TOKEN
          const verificationPayload = {
            userId: findUser.id,
            role: findUser.roles,
            exp: authConfig.verificationEmailSecretExpIn,
          };

          const verificationToken = await sign(
            verificationPayload,
            authConfig.verificationSecret
          );

          // SEND EMAIL VERIFICATION
          await sendEmailVerification({
            c,
            to: findUser.name,
            verificationToken,
            emailToVerify: findUser.email,
          });

          return SendResponse.success(c, null, 'email verification success');
        }

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
          { email: findUser.email },
          'login successfully'
        );
      } catch (e) {
        if (e instanceof Error) {
          SendResponse.error(c, null, e.message);
        }
      }
    });
  };

  private getUser = (path: string) => {
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
          SendResponse.error(c, null, e.message);
        }
      }
    });
  };

  private verifyUser = (path: string) => {
    return this.route.get(path, async (c) => {
      try {
        // GET TOKEN FROM QUERYPARAMS
        const { token, email } = c.req.query();
        // FIND USER FIRST
        const findUser = await findUserByEmail(email);
        if (!findUser) throw new Error('user not found');

        // DECODED TOKEN
        const decodedToken = await verify(token, authConfig.verificationSecret);
        if (decodedToken && decodedToken.exp) {
          // IF TOKEN IS < THAN DATA NOW
          if (decodedToken.exp < Date.now()) {
            throw new Error('token has expired');
          }

          // UPDATE USER TABLE
          await db.users.update({
            where: { id: findUser.id },
            data: { verifiedEmail: true },
          });

          // REDIRECT TO SIGN IN PAGE
          return c.redirect(
            `http://${appConfig.host}:${appConfig.port}/api/auth/verification-success?token=${token}`,
            301
          );
        }
      } catch (e) {
        if (e instanceof Error) {
          return SendResponse.error(c, null, e.message);
        }
      }
    });
  };

  // SHOULD BE PROTECT BY MIDDLEWARE MAYBE allip
  private verifySuccess = (path: string) => {
    return this.route.get(path, async (c) => {
      try {
        // GET TOKEN FROM QUERY PARAMS
        const { token } = c.req.query();
        if (!token) {
          throw new Error('you not authorized to access this resource');
        }

        // DECODED TOKEN AND VALIDATE
        const decodedToken = await verify(token, authConfig.verificationSecret);
        if (decodedToken && decodedToken.exp) {
          if (decodedToken.exp < Date.now()) {
            throw new Error('you not authorized to access this resource');
          }

          return SendResponse.success(c, null, 'verification-success');
        }
      } catch (e) {
        if (e instanceof Error) {
          return SendResponse.error(c, null, e.message);
        }
      }
    });
  };
}

export default new AuthController();
