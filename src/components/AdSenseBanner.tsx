import { useEffect, useRef, useState } from 'react';

type AdSenseBannerProps = {
  slot?: string;
  slotKey?: 'home' | 'listings' | 'listingsSidebar' | 'listingDetail';
  className?: string;
  format?: 'auto' | 'rectangle' | 'vertical';
};

type AdSenseConfig = {
  enabled: boolean;
  clientId: string;
  autoAdsEnabled: boolean;
  homeSlot: string;
  listingsSlot: string;
  listingsSidebarSlot: string;
  listingDetailSlot: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const DEFAULT_CLIENT_ID = 'ca-pub-1826576243729056';

const resolveSlot = (config: AdSenseConfig | null, slotKey?: AdSenseBannerProps['slotKey'], fallbackSlot?: string) => {
  if (config && slotKey) {
    const keyMap = {
      home: config.homeSlot,
      listings: config.listingsSlot,
      listingsSidebar: config.listingsSidebarSlot,
      listingDetail: config.listingDetailSlot,
    } as const;
    const configured = keyMap[slotKey as keyof typeof keyMap];
    if (configured) return configured;
  }
  return fallbackSlot || '';
};

/**
 * A reserved, responsive placement for an AdSense display unit.
 *
 * The banner is active when the public env slot is configured or when an admin-
 * managed AdSense profile is enabled. Admin settings persist in system_configs so
 * changes take effect without a redeploy.
 */
export default function AdSenseBanner({
  slot,
  slotKey,
  className = '',
  format = 'auto',
}: AdSenseBannerProps) {
  const initialized = useRef(false);
  const [config, setConfig] = useState<AdSenseConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      try {
        const response = await fetch('/api/adsense/config', { cache: 'no-store' });
        if (!response.ok) {
          if (active) setConfig(null);
          return;
        }
        const payload = (await response.json()) as { config?: Partial<AdSenseConfig> };
        if (active) {
          setConfig({
            enabled: Boolean(payload.config?.enabled),
            clientId: payload.config?.clientId || DEFAULT_CLIENT_ID,
            autoAdsEnabled: Boolean(payload.config?.autoAdsEnabled),
            homeSlot: payload.config?.homeSlot || '',
            listingsSlot: payload.config?.listingsSlot || '',
            listingsSidebarSlot: payload.config?.listingsSidebarSlot || '',
            listingDetailSlot: payload.config?.listingDetailSlot || '',
          });
        }
      } catch {
        if (active) setConfig(null);
      }
    };

    void loadConfig();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const resolvedSlot = resolveSlot(config, slotKey, slot);
    if (!resolvedSlot || initialized.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [config, slot, slotKey]);

  const resolvedSlot = resolveSlot(config, slotKey, slot);
  const enabled = config ? config.enabled : Boolean(slot);
  const clientId = config?.clientId || DEFAULT_CLIENT_ID;

  if (!enabled || (!resolvedSlot && !config?.autoAdsEnabled)) return null;

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
          data-ad-client={clientId}
          data-ad-slot={resolvedSlot || undefined}
          data-ad-format={format}
          data-full-width-responsive={format === 'auto' ? 'true' : undefined}
        />
      </div>
    </section>
  );
}
