import { Context } from 'hono';

class SendResponse {
  static success = (c: Context, data: any, message: string) => {
    return c.json({
      ok: true,
      statusCode: 201,
      message,
      data: { ...data },
    });
  };

  static error = (c: Context, data: any, message: string) => {
    return c.json(
      {
        ok: false,
        statusCode: 500,
        message: message,
        data,
      },
      500
    );
  };
}

export default SendResponse;
