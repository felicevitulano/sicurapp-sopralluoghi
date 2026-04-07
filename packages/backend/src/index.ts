import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { clientiRouter } from './routes/clienti';
import { sopralluoghiRouter } from './routes/sopralluoghi';
import { mediaRouter } from './routes/media';
import { reportRouter } from './routes/report';
import { notificheRouter } from './routes/notifiche';
import { startScadenzeJob } from './services/scadenzeJob';

const app = express();
const PORT = process.env.PORT || 3001;
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(__dirname, '..', 'media');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Serve media files
app.use('/media', express.static(MEDIA_DIR));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/clienti', clientiRouter);
app.use('/api/sopralluoghi', sopralluoghiRouter);
app.use('/api/sopralluoghi', mediaRouter);
app.use('/api/sopralluoghi', reportRouter);
app.use('/api/notifiche', notificheRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'SicurApp backend avviato');
  startScadenzeJob();
});

export default app;
