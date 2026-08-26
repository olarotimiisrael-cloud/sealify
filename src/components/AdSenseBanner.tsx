import { useEffect, useRef, useState } from 'react';

type AdSenseBannerProps = {
  slot?: string;
  className?: string;
  format?: 'auto' | 'rectangle' | 'vertical';
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A reserved, responsive placement for an AdSense display unit.
 *
 * AdSense slot IDs deliberately come from public Vite variables instead of
 * source code. Until a real slot ID is configured, nothing is rendered and no
 * ad request is made.
 */
export default function AdSenseBanner({
  slot,
  className = '',
  format = 'auto',
}: AdSenseBannerProps) {
  const initialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slot || initialized.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
      setIsLoading(false);
    } catch {
      // Ad blockers and unavailable ad inventory should not affect the page.
      setIsLoading(false);
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 ${className}`} aria-label="Advertisement">
      <div className="flex items-center gap-2 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span className="h-px flex-1 bg-slate-800" />
        Advertisement
        <span className="h-px flex-1 bg-slate-800" />
      </div>
      <div className="relative min-h-[110px]">
        {isLoading && <div className="absolute inset-x-5 top-5 h-16 animate-pulse rounded-xl bg-slate-800/70" aria-hidden="true" />}
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1826576243729056"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={format === 'auto' ? 'true' : undefined}
        />
      </div>
    </section>
  );
}
