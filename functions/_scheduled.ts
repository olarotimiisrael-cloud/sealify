// Scheduled worker: drains the email_outbox every 5 minutes.
// Registered in wrangler.toml under [triggers] -> crons.

export const onScheduled = async (event: { env: any; waitUntil: (promise: Promise<any>) => void }) => {
  const { env, waitUntil } = event;
  const origin = env.APP_URL || env.PUBLIC_SITE_URL || 'http://localhost:8788';
  const token = env.INTERNAL_API_TOKEN;

  const promise = (async () => {
    try {
      const res = await fetch(`${origin}/api/email/drain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-Internal-Token': token } : {}),
        },
      });
      if (!res.ok) {
        console.error(`[scheduled] drain failed: ${res.status} ${await res.text().catch(() => '')}`);
      } else {
        const data = await res.json().catch(() => ({}));
        console.log(`[scheduled] drain completed:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('[scheduled] drain error:', err);
    }
  })();

  waitUntil(promise);
};
