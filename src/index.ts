import { Hono } from 'hono';
import ping from './routes/ping';
import api from './routes/api';

const app = new Hono();

app.route('/ping', ping);
app.route('/api', api);

export default app
