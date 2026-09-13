import app from './index';

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env, context);
};