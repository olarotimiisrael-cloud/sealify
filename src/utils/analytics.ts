// Lightweight analytics utility (no external dependencies)
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

const SESSION_ID = crypto.randomUUID();
const EVENT_QUEUE: AnalyticsEvent[] = [];
const FLUSH_INTERVAL = 30000; // 30 seconds
const MAX_QUEUE_SIZE = 50;

export const trackEvent = (event: string, properties?: Record<string, any>): void => {
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
    timestamp: new Date().toISOString(),
    sessionId: SESSION_ID,
  };

  EVENT_QUEUE.push(analyticsEvent);

  if (EVENT_QUEUE.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  }
};

export const flushEvents = async (): Promise<void> => {
  if (EVENT_QUEUE.length === 0) return;

  const events = [...EVENT_QUEUE];
  EVENT_QUEUE.length = 0;

  try {
    // Send to your analytics endpoint (replace with your endpoint)
    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch (error) {
    // Re-queue on failure (optional: store in localStorage for retry)
    console.warn('Analytics flush failed:', error);
    EVENT_QUEUE.unshift(...events);
  }
};

// Auto-flush interval
setInterval(flushEvents, FLUSH_INTERVAL);

// Flush on page unload
window.addEventListener('beforeunload', flushEvents);

// Convenience methods
export const analytics = {
  pageView: (page: string) => trackEvent('page_view', { page }),
  click: (element: string, context?: string) => trackEvent('click', { element, context }),
  search: (query: string, results: number) => trackEvent('search', { query, results }),
  adView: (adId: string, category: string) => trackEvent('ad_view', { adId, category }),
  adClick: (adId: string) => trackEvent('ad_click', { adId }),
  messageSent: (conversationId: string) => trackEvent('message_sent', { conversationId }),
  offerMade: (adId: string, amount: number) => trackEvent('offer_made', { adId, amount }),
  profileView: (userId: string) => trackEvent('profile_view', { userId }),
  walletAction: (action: string, amount: number) => trackEvent('wallet_action', { action, amount }),
  verificationStarted: (type: string) => trackEvent('verification_started', { type }),
  promotionPurchased: (plan: string, amount: number) => trackEvent('promotion_purchased', { plan, amount }),
};