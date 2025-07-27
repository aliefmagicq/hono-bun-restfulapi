import { Hono } from 'hono';
import AuthController from './auth/auth.controller';

const app = new Hono().basePath('/api');

app.get('/', (c) => {
  return c.text('Hello This is Alief Khairul😊!');
});

app.route('/auth', AuthController.route);

export default app;
