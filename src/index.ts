import { Hono } from 'hono';
import ping from './routes/ping';

const app = new Hono();

app.route('/ping', ping);

export default app
