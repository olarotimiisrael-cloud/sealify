import { Hono } from 'hono';
import { corsMiddleware } from './cors';
import { errorMiddleware } from './error';
import type { Env } from './types';

export function createBaseApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use('*', corsMiddleware);
  app.use('*', errorMiddleware);

  return app;
}