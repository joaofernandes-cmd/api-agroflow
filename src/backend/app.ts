import express from 'express';
import retiroRouter from './routes/retiro.routes';
import ticketRouter from './routes/ticket.routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(retiroRouter);
app.use(ticketRouter);

export default app;
