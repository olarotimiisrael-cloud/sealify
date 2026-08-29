import { createApp } from './app.js';
import { config } from './config.js';
import { closeDb } from './db/postgres.js';

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Sealify API server running on port ${config.port}`);
  console.log(`Environment: ${config.isProduction ? 'production' : 'development'}`);
});

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
