const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const config = require('./config');
const logger = require('./logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URLS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.CLIENT_URLS, credentials: true }));
app.use(express.json());
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

app.use(errorHandler);

async function initSocketAdapter() {
  if (!config.REDIS_URL) {
    logger.info('No REDIS_URL configured, running Socket.io without Redis adapter');
    return;
  }

  const pubClient = createClient({ url: config.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.io Redis adapter initialized');
}

async function start() {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  logger.info('✅ MongoDB connected');
  await initSocketAdapter();
  require('./socket/socketHandler')(io);

  server.listen(config.PORT, () => {
    logger.info(`🚀 NexTalk server running on port ${config.PORT}`);
  });
}

start().catch((error) => {
  logger.error(error, 'Failed to start NexTalk server');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception');
  process.exit(1);
});
