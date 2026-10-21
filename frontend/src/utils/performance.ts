// Performance monitoring utilities
import { apiUrl } from '@/lib/env';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

const METRICS: PerformanceMetric[] = [];

export const measurePerformance = (): void => {
  if (!('performance' in window)) return;

  // Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        recordMetric('LCP', entry.startTime);
      } else if (entry.entryType === 'first-input') {
        recordMetric('FID', (entry as any).processingStart - entry.startTime);
      } else if (entry.entryType === 'layout-shift') {
        if (!(entry as any).hadRecentInput) {
          recordMetric('CLS', (entry as any).value);
        }
      } else if (entry.entryType === 'navigation') {
        const nav = entry as PerformanceNavigationTiming;
        recordMetric('TTFB', nav.responseStart - nav.requestStart);
        recordMetric('FCP', nav.responseEnd - nav.requestStart);
      }
    }
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });

  // Resource timing
  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      if (resource.duration > 1000) { // Log slow resources (>1s)
        console.warn(`Slow resource: ${resource.name} took ${resource.duration.toFixed(0)}ms`);
      }
    }
  });

  resourceObserver.observe({ entryTypes: ['resource'] });
};

const recordMetric = (name: string, value: number): void => {
  let rating: 'good' | 'needs-improvement' | 'poor';

  switch (name) {
    case 'LCP':
      rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      break;
    case 'FID':
      rating = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      break;
    case 'CLS':
      rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      break;
    case 'TTFB':
      rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      break;
    case 'FCP':
      rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      break;
    default:
      rating = 'good';
  }

  METRICS.push({ name, value, rating, timestamp: new Date().toISOString() });

  // Log poor metrics
  if (rating === 'poor') {
    console.warn(`Poor ${name}: ${value.toFixed(0)}ms`);
  }
};

export const getMetrics = (): PerformanceMetric[] => [...METRICS];

export const reportMetrics = async (): Promise<void> => {
  if (METRICS.length === 0) return;

  try {
    await fetch(apiUrl('/api/analytics/performance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: METRICS, sessionId: crypto.randomUUID() }),
      keepalive: true,
    });
  } catch (error) {
    console.warn('Performance reporting failed:', error);
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      measurePerformance();
      // Report after 5 seconds to capture all metrics
      setTimeout(reportMetrics, 5000);
    }, 0);
  });
}