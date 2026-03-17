const path = require('path');
const express = require('express');
const { env } = require('./config/env');
const { connectMongo } = require('./db/mongo');
const { HttpError } = require('./utils/errors');
const { authRouter } = require('./routes/auth');
const { postsRouter } = require('./routes/posts');

async function main() {
  await connectMongo(env.mongoUri);

  const app = express();

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/posts', postsRouter);

  const frontendDir = path.join(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

  app.get('/', (_req, res) => res.sendFile(path.join(frontendDir, 'index.html')));

  app.use((req, _res, next) => next(new HttpError(404, `Route not found: ${req.method} ${req.path}`)));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    const message = err?.message ?? 'Server error';
    const details =
      env.nodeEnv === 'development'
        ? {
            name: err?.name,
            stack: err?.stack
          }
        : undefined;

    res.status(status).json({ error: { message, ...(details ? { details } : {}) } });
  });

  app.listen(env.port, () => {
    // Intentionally a tiny log so you can see it started.
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

