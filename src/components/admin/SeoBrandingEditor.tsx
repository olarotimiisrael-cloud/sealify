import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Globe,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Palette,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminFetch } from '@/lib/admin-api';
import {
  DEFAULT_SITE_METADATA,
  EDITABLE_PAGE_DEFINITIONS,
  PAGE_DEFINITIONS,
  auditSiteMetadata,
  buildHeadHtml,
  exportSiteMetadata,
  importSiteMetadata,
  resolveMetadataForBrowser,
  siteMetadataUpdateSchema,
  toUpdatePayload,
  type PageDefinition,
  type PageMetadataOverride,
  type ResolvedMetadata,
  type SeoAudit,
  type SiteMetadata,
} from '@/lib/siteMetadata';
import { ASSET_RULES, uploadSiteAsset, type AssetKind } from '@/lib/siteAssets';
import { useSiteMetadata } from '@/context/SiteMetadataContext';

type AssetField = 'faviconUrl' | 'logoUrl' | 'ogImage' | 'appleTouchIconUrl';

interface ApiResponse {
  error?: string;
  settings?: Partial<SiteMetadata>;
  fields?: Record<string, string>;
  changedFields?: string[];
}

const TITLE_RECOMMENDED = 60;
const DESCRIPTION_RECOMMENDED = 160;

type SectionId = 'branding' | 'headings' | 'search' | 'social' | 'pages' | 'audit';

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'headings', label: 'Headings', icon: Type },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'social', label: 'Link preview', icon: Share2 },
  { id: 'pages', label: 'Pages', icon: Globe },
  { id: 'audit', label: 'Audit & export', icon: Sparkles },
];

/* -------------------------------------------------------------------------- */
/* Presentational helpers                                                      */
/* -------------------------------------------------------------------------- */

const CharacterCount: React.FC<{ value: string; recommended: number; max: number }> = ({
  value,
  recommended,
  max,
}) => (
  <span
    className={`font-mono text-[10px] ${
      value.length > max ? 'text-rose-400' : value.length > recommended ? 'text-amber-400' : 'text-emerald-400'
    }`}
  >
    {value.length}/{max}
    {value.length > recommended && <span className="ml-1">({value.length - recommended} over)</span>}
  </span>
);

const FieldRow: React.FC<{ label: string; hint?: string; error?: string; children: React.ReactNode }> = ({
  label,
  hint,
  error,
  children,
}) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">{label}</Label>
    {children}
    {error ? (
      <p className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
        <AlertTriangle className="w-3 h-3" /> {error}
      </p>
    ) : hint ? (
      <p className="text-[10px] text-slate-500">{hint}</p>
    ) : null}
  </div>
);

const AssetField: React.FC<{
  label: string;
  hint?: string;
  value: string;
  error?: string;
  previewSize: 'small' | 'large';
  uploading: boolean;
  onPick: () => void;
  onChange: (value: string) => void;
}> = ({ label, hint, value, error, previewSize, uploading, onPick, onChange }) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">{label}</Label>

      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950 ${
            previewSize === 'small' ? 'h-16 w-16' : 'h-24 w-40'
          }`}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain p-1"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.visibility = 'hidden';
              }}
            />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          ) : (
            <Upload className="h-5 w-5 text-slate-600" />
          )}
        </div>

        <div className="min-w-[220px] flex-1 space-y-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              if (draft !== value) onChange(draft.trim());
            }}
            placeholder="https://… or /logo.png"
            className="bg-slate-950 text-xs"
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPick}
              disabled={uploading}
              className="text-[10px] font-bold"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft('');
                  onChange('');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-[10px] font-bold text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
};

const GooglePreview: React.FC<{ resolved: ResolvedMetadata }> = ({ resolved }) => (
  <div className="rounded-2xl border border-slate-800 bg-white p-4 text-left">
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
        {(resolved.siteName || 'S').slice(0, 1).toUpperCase()}
      </span>
      <div className="leading-tight">
        <p className="text-[11px] font-semibold text-slate-900">{resolved.siteName}</p>
        <p className="text-[10px] text-slate-600">{resolved.ogSiteUrl.replace(/^https?:\/\//, '')}</p>
      </div>
    </div>
    <p className="mt-1.5 text-[15px] leading-snug text-[#1a0dab]">{resolved.title}</p>
    <p className="mt-0.5 text-[11px] leading-relaxed text-[#4d5156]">{resolved.description}</p>
  </div>
);

const SocialPreview: React.FC<{ resolved: ResolvedMetadata }> = ({ resolved }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-100">
    {resolved.image ? (
      <img src={resolved.image} alt="" className="h-40 w-full bg-slate-200 object-cover" />
    ) : (
      <div className="flex h-40 w-full items-center justify-center bg-slate-200 text-[10px] font-bold uppercase text-slate-400">
        No share image set
      </div>
    )}
    <div className="space-y-0.5 bg-white px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {resolved.ogSiteUrl.replace(/^https?:\/\//, '')}
      </p>
      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">{resolved.ogTitle}</p>
      <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-600">{resolved.ogDescription}</p>
    </div>
  </div>
);

const BrowserPreview: React.FC<{ resolved: ResolvedMetadata }> = ({ resolved }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-left">
    <div className="mb-2 flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-rose-500/70" />
      <span className="h-2 w-2 rounded-full bg-amber-500/70" />
      <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
    </div>
    <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2">
      {resolved.faviconUrl ? (
        <img
          src={resolved.faviconUrl}
          alt=""
          className="h-4 w-4 shrink-0 rounded-sm bg-slate-800 object-contain"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).style.visibility = 'hidden';
          }}
        />
      ) : null}
      <span className="truncate text-[11px] text-slate-400">{resolved.title}</span>
    </div>
    <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
      <ImageIcon className="h-3 w-3" /> Favicon + tab title render on every page
    </p>
  </div>
);

const AuditRow: React.FC<{ audit: SeoAudit; onPreview: (path: string) => void }> = ({ audit, onPreview }) => {
  const tone =
    audit.score >= 90 ? 'text-emerald-400' : audit.score >= 70 ? 'text-amber-400' : 'text-rose-400';

  return (
    <details className="rounded-xl border border-slate-800 bg-slate-950/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white">
        <span className="flex items-center gap-2">
          <span className={`font-mono text-sm ${tone}`}>{audit.score}</span>
          <span className="font-mono text-[10px] font-normal text-slate-500">{audit.path}</span>
          <span className="text-[10px] font-normal text-slate-400">{audit.label}</span>
        </span>
        <span className="flex items-center gap-2">
          {audit.issues.length === 0 ? (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              <Check className="mr-1 h-3 w-3" /> Perfect
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/30 text-amber-400">
              {audit.issues.length} issue{audit.issues.length === 1 ? '' : 's'}
            </Badge>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onPreview(audit.path);
            }}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400"
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
        </span>
      </summary>

      <div className="space-y-1.5 border-t border-slate-800 px-4 py-3">
        {audit.issues.length === 0 ? (
          <p className="text-[11px] text-emerald-400">Nothing to fix on this page.</p>
        ) : (
          audit.issues.map((issue, index) => (
            <div key={index} className="flex items-start gap-2 text-[11px]">
              <span
                className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  issue.level === 'error'
                    ? 'bg-rose-400'
                    : issue.level === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                }`}
              />
              <span className="text-slate-300">
                {issue.message}
                {issue.hint && <span className="text-slate-500"> — {issue.hint}</span>}
                <span className="ml-1 font-mono text-[9px] text-slate-600">{issue.field}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </details>
  );
};

/* -------------------------------------------------------------------------- */
/* Editor                                                                      */
/* -------------------------------------------------------------------------- */

export interface SeoBrandingEditorProps {
  /** Rendered inside the admin dashboard tab rather than a standalone page. */
  embedded?: boolean;
}

/**
 * Complete, administrator-controlled SEO and branding editor.
 *
 * Persists through `/api/admin/site-metadata` (zod-validated server side) and
 * renders the exact tags the Cloudflare edge serves to crawlers.
 */
export const SeoBrandingEditor: React.FC<SeoBrandingEditorProps> = ({ embedded = false }) => {
  const { refresh: refreshPublicMetadata } = useSiteMetadata();

  const [form, setForm] = useState<SiteMetadata>(DEFAULT_SITE_METADATA);
  const [baseline, setBaseline] = useState<SiteMetadata>(DEFAULT_SITE_METADATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploading, setUploading] = useState<AssetKind | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [section, setSection] = useState<SectionId>('branding');
  const [previewPath, setPreviewPath] = useState('/');
  const [showHeadTags, setShowHeadTags] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fileInputs = useRef<Record<AssetKind, HTMLInputElement | null>>({
    favicon: null,
    logo: null,
    og: null,
  });

  const importInput = useRef<HTMLInputElement | null>(null);

  /* Load ------------------------------------------------------------------ */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/site-metadata');
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) throw new Error(payload?.error || 'Unable to load site metadata');

      const settings: SiteMetadata = { ...DEFAULT_SITE_METADATA, ...payload?.settings };
      setForm(settings);
      setBaseline(settings);
      setFieldErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load site metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* Derived --------------------------------------------------------------- */

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline]);

  const origin = useMemo(() => {
    // No fixed domain here: a hardcoded fallback produced previews and
    // absolute asset URLs for a host that does not serve this deployment.
    if (typeof window === 'undefined') return '';
    return form.canonicalUrl || window.location.origin;
  }, [form.canonicalUrl]);

  const preview = useMemo<ResolvedMetadata>(
    () => resolveMetadataForBrowser(form, previewPath),
    [form, previewPath],
  );

  const audits = useMemo(() => auditSiteMetadata(form, origin), [form, origin]);

  const auditScore = useMemo(() => {
    if (audits.length === 0) return 100;
    return Math.round(audits.reduce((total, audit) => total + audit.score, 0) / audits.length);
  }, [audits]);

  const previewPages = useMemo<PageDefinition[]>(
    () => [
      { ...PAGE_DEFINITIONS[0], label: 'Home' },
      ...EDITABLE_PAGE_DEFINITIONS.filter((definition) => definition.path !== '/'),
    ],
    [],
  );

  /* Unsaved-changes guard ------------------------------------------------- */

  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  /* Mutations ------------------------------------------------------------- */

  const update = useCallback(<K extends keyof SiteMetadata>(key: K, value: SiteMetadata[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  }, []);

  const updatePageOverride = useCallback((path: string, patch: Partial<PageMetadataOverride>) => {
    setForm((previous) => ({
      ...previous,
      pageMetadata: {
        ...previous.pageMetadata,
        [path]: { ...(previous.pageMetadata[path] || {}), ...patch },
      },
    }));
  }, []);

  const clearPageOverride = useCallback((path: string) => {
    setForm((previous) => {
      const next = { ...previous.pageMetadata };
      delete next[path];
      return { ...previous, pageMetadata: next };
    });
  }, []);

  /** Applies one value to every editable page that has no custom override. */
  const applyToAllPages = useCallback((patch: Partial<PageMetadataOverride>) => {
    setForm((previous) => {
      const next = { ...previous.pageMetadata };
      for (const definition of EDITABLE_PAGE_DEFINITIONS) {
        if (definition.path === '/') continue;
        next[definition.path] = { ...(next[definition.path] || {}), ...patch };
      }
      return { ...previous, pageMetadata: next };
    });
    toast.success('Applied to every page');
  }, []);

  /* Uploads --------------------------------------------------------------- */

  const handleFile = async (kind: AssetKind, file: File | undefined, field: AssetField) => {
    if (!file) return;

    setUploading(kind);
    try {
      const result = await uploadSiteAsset(kind, file, form[field] || null);
      update(field, result.url as SiteMetadata[typeof field]);

      if (kind === 'favicon' && !form.appleTouchIconUrl) {
        update('appleTouchIconUrl', result.url as SiteMetadata['appleTouchIconUrl']);
      }

      toast.success('Asset uploaded. Remember to save your changes.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  /* Save ------------------------------------------------------------------ */

  const validate = useCallback((): Record<string, string> => {
    const parsed = siteMetadataUpdateSchema.safeParse(toUpdatePayload(form));
    if (parsed.success) return {};

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path.join('.') || 'settings';
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});
  }, [form]);

  const handleSave = useCallback(async () => {
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Fix the highlighted fields before saving');
      setSection('branding');
      return;
    }

    setSaving(true);
    try {
      const response = await adminFetch('/api/admin/site-metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toUpdatePayload(form)),
      });

      const payload = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (payload?.fields) setFieldErrors(payload.fields);
        throw new Error(payload?.error || 'The changes could not be saved');
      }

      const saved: SiteMetadata = { ...DEFAULT_SITE_METADATA, ...payload?.settings };
      setForm(saved);
      setBaseline(saved);
      setLastSavedAt(new Date().toISOString());

      await refreshPublicMetadata();

      const changed = payload?.changedFields || [];
      toast.success(
        changed.length > 0
          ? `Saved — updated ${changed.length} field${changed.length === 1 ? '' : 's'}`
          : 'Saved',
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The changes could not be saved');
    } finally {
      setSaving(false);
    }
  }, [form, refreshPublicMetadata]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty && !saving) void handleSave();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, saving, handleSave]);

  const handleReset = async (scope: 'all' | 'branding' | 'seo') => {
    setResetting(true);
    try {
      const response = await adminFetch('/api/admin/site-metadata/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(payload?.error || 'Reset failed');

      const settings: SiteMetadata = { ...DEFAULT_SITE_METADATA, ...payload?.settings };
      setForm(settings);
      setBaseline(settings);
      await refreshPublicMetadata();

      toast.success(
        scope === 'all'
          ? 'All site metadata reset to defaults'
          : `${scope === 'branding' ? 'Branding' : 'SEO'} reset to defaults`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  /* Import / export ------------------------------------------------------- */

  const handleExport = () => {
    try {
      const blob = new Blob([exportSiteMetadata(form)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sealify-site-metadata-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Configuration downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;

    setImporting(true);
    try {
      const payload = importSiteMetadata(await file.text());
      const merged = { ...DEFAULT_SITE_METADATA, ...payload } as SiteMetadata;
      const errors = validatePayload(payload);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error('That file has invalid values — review the highlighted fields');
        return;
      }

      setForm(merged);
      setLastSavedAt(null);
      toast.success('Configuration loaded — review, then save to apply');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const validatePayload = (payload: Record<string, unknown>): Record<string, string> => {
    const parsed = siteMetadataUpdateSchema.safeParse(payload);
    if (parsed.success) return {};

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path.join('.') || 'settings';
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});
  };

  const pageOverride = (path: string): PageMetadataOverride => form.pageMetadata?.[path] || {};

  /* Render ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`gap-1 ${
              auditScore >= 90
                ? 'border-emerald-500/30 text-emerald-400'
                : auditScore >= 70
                  ? 'border-amber-500/40 text-amber-400'
                  : 'border-rose-500/40 text-rose-400'
            }`}
          >
            <Sparkles className="h-3 w-3" /> SEO score {auditScore}/100
          </Badge>

          {dirty ? (
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-400">
              <AlertTriangle className="h-3 w-3" /> Unsaved changes
            </Badge>
          ) : lastSavedAt ? (
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-400">
              <Check className="h-3 w-3" /> Saved {new Date(lastSavedAt).toLocaleTimeString()}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-slate-700 text-slate-400">
              <Check className="h-3 w-3" /> In sync
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!dirty}
            onClick={() => {
              setForm(baseline);
              setFieldErrors({});
            }}
            className="text-[10px] font-bold"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Discard
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={resetting}
            onClick={() => void handleReset('branding')}
            className="text-[10px] font-bold"
          >
            <Palette className="h-3.5 w-3.5" /> Reset branding
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={resetting}
            onClick={() => void handleReset('seo')}
            className="text-[10px] font-bold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset SEO
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving || !dirty}
            className="bg-emerald-500 text-[10px] font-black text-slate-950 hover:bg-emerald-400"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save changes
          </Button>
        </div>
      </div>

      <div className={embedded ? 'grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]' : 'grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]'}>
        {/* Editor column */}
        <div className="space-y-4">
          {/* Section switcher */}
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((entry) => {
              const Icon = entry.icon;
              const active = section === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSection(entry.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${
                    active
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {entry.label}
                </button>
              );
            })}
          </div>

          {section === 'branding' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                    <Palette className="h-4 w-4" />
                  </span>
                  Branding &amp; favicon
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Site identity, favicon, logo, PWA branding and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow label="Site name" error={fieldErrors.siteName} hint="Used for the tab title and og:site_name">
                    <Input
                      value={form.siteName}
                      onChange={(event) => update('siteName', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                  <FieldRow label="Contact email" error={fieldErrors.contactEmail}>
                    <Input
                      value={form.contactEmail}
                      onChange={(event) => update('contactEmail', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>

                <FieldRow
                  label="Site description"
                  error={fieldErrors.siteDescription}
                  hint="Default description when a page has no specific one"
                >
                  <Textarea
                    rows={3}
                    value={form.siteDescription}
                    onChange={(event) => update('siteDescription', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <FieldRow label="Contact phone">
                  <Input
                    value={form.contactPhone}
                    onChange={(event) => update('contactPhone', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <Separator className="bg-slate-800" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <AssetField
                    label="Favicon"
                    hint={ASSET_RULES.favicon.hint}
                    value={form.faviconUrl}
                    error={fieldErrors.faviconUrl}
                    previewSize="small"
                    uploading={uploading === 'favicon'}
                    onPick={() => fileInputs.current.favicon?.click()}
                    onChange={(value) => update('faviconUrl', value)}
                  />
                  <AssetField
                    label="Apple touch icon"
                    hint="Shown on iOS home screens"
                    value={form.appleTouchIconUrl}
                    error={fieldErrors.appleTouchIconUrl}
                    previewSize="small"
                    uploading={false}
                    onPick={() => fileInputs.current.favicon?.click()}
                    onChange={(value) => update('appleTouchIconUrl', value)}
                  />
                </div>

                <AssetField
                  label="Site logo"
                  hint={ASSET_RULES.logo.hint}
                  value={form.logoUrl}
                  error={fieldErrors.logoUrl}
                  previewSize="large"
                  uploading={uploading === 'logo'}
                  onPick={() => fileInputs.current.logo?.click()}
                  onChange={(value) => update('logoUrl', value)}
                />

                <Separator className="bg-slate-800" />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldRow label="Theme colour" error={fieldErrors.themeColor} hint="Browser UI tint">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.themeColor}
                        onChange={(event) => update('themeColor', event.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-slate-700 bg-slate-950"
                        aria-label="Theme colour"
                      />
                      <Input
                        value={form.themeColor}
                        onChange={(event) => update('themeColor', event.target.value)}
                        className="bg-slate-950 font-mono text-xs"
                      />
                    </div>
                  </FieldRow>
                  <FieldRow label="PWA name" error={fieldErrors.manifestName}>
                    <Input
                      value={form.manifestName}
                      onChange={(event) => update('manifestName', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                  <FieldRow label="PWA short name" error={fieldErrors.manifestShortName}>
                    <Input
                      value={form.manifestShortName}
                      onChange={(event) => update('manifestShortName', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'headings' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                    <Type className="h-4 w-4" />
                  </span>
                  Homepage headings
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  The hero copy on the landing page. Use <code className="text-slate-300">|</code> to
                  highlight everything after it in the accent colour.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldRow label="Badge" error={fieldErrors.headingHomeBadge}>
                  <Input
                    value={form.headingHomeBadge}
                    onChange={(event) => update('headingHomeBadge', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <FieldRow label="Heading" error={fieldErrors.headingHomeTitle}>
                  <Textarea
                    rows={2}
                    value={form.headingHomeTitle}
                    onChange={(event) => update('headingHomeTitle', event.target.value)}
                    className="bg-slate-950 text-sm font-bold"
                  />
                </FieldRow>

                <FieldRow label="Sub-heading" error={fieldErrors.headingHomeSubtitle}>
                  <Textarea
                    rows={3}
                    value={form.headingHomeSubtitle}
                    onChange={(event) => update('headingHomeSubtitle', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow label="Call-to-action label" error={fieldErrors.headingHomeCta}>
                    <Input
                      value={form.headingHomeCta}
                      onChange={(event) => update('headingHomeCta', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                  <FieldRow label="Call-to-action link" error={fieldErrors.headingHomeCtaUrl}>
                    <Input
                      value={form.headingHomeCtaUrl}
                      onChange={(event) => update('headingHomeCtaUrl', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'search' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                    <Search className="h-4 w-4" />
                  </span>
                  Search appearance
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  What Google reads for the landing page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldRow label="Homepage title" error={fieldErrors.pageTitleHome}>
                  <Input
                    value={form.pageTitleHome}
                    onChange={(event) => update('pageTitleHome', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                  <CharacterCount value={form.pageTitleHome} recommended={TITLE_RECOMMENDED} max={120} />
                </FieldRow>

                <FieldRow label="Homepage meta description" error={fieldErrors.metaDescriptionHome}>
                  <Textarea
                    rows={3}
                    value={form.metaDescriptionHome}
                    onChange={(event) => update('metaDescriptionHome', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                  <CharacterCount
                    value={form.metaDescriptionHome}
                    recommended={DESCRIPTION_RECOMMENDED}
                    max={320}
                  />
                </FieldRow>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow
                    label="Canonical base URL"
                    error={fieldErrors.canonicalUrl}
                    hint="Leave empty to use the deployment origin"
                  >
                    <Input
                      value={form.canonicalUrl}
                      onChange={(event) => update('canonicalUrl', event.target.value)}
                      placeholder="https://sealify.ng"
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                  <div className="flex items-end justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                        Allow search indexing
                      </Label>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Turn off to publish a noindex,nofollow site.
                      </p>
                    </div>
                    <Switch
                      checked={form.robotsIndexing}
                      onCheckedChange={(checked) => update('robotsIndexing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'social' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                    <Share2 className="h-4 w-4" />
                  </span>
                  Link previews (Open Graph &amp; Twitter)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Drives WhatsApp, X, Facebook, Slack and iMessage previews.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AssetField
                  label="Share image (og:image)"
                  hint={ASSET_RULES.og.hint}
                  value={form.ogImage}
                  error={fieldErrors.ogImage}
                  previewSize="large"
                  uploading={uploading === 'og'}
                  onPick={() => fileInputs.current.og?.click()}
                  onChange={(value) => update('ogImage', value)}
                />

                <FieldRow label="Open Graph title" error={fieldErrors.ogTitle}>
                  <Input
                    value={form.ogTitle}
                    onChange={(event) => update('ogTitle', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                  <CharacterCount value={form.ogTitle} recommended={TITLE_RECOMMENDED} max={120} />
                </FieldRow>

                <FieldRow label="Open Graph description" error={fieldErrors.ogDescription}>
                  <Textarea
                    rows={2}
                    value={form.ogDescription}
                    onChange={(event) => update('ogDescription', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                  <CharacterCount
                    value={form.ogDescription}
                    recommended={DESCRIPTION_RECOMMENDED}
                    max={320}
                  />
                </FieldRow>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldRow label="og:type" error={fieldErrors.ogType}>
                    <Select
                      value={form.ogType}
                      onValueChange={(value) => update('ogType', value as SiteMetadata['ogType'])}
                    >
                      <SelectTrigger className="bg-slate-950 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">website</SelectItem>
                        <SelectItem value="article">article</SelectItem>
                        <SelectItem value="product">product</SelectItem>
                        <SelectItem value="profile">profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="og:locale" error={fieldErrors.ogLocale}>
                    <Input
                      value={form.ogLocale}
                      onChange={(event) => update('ogLocale', event.target.value)}
                      className="bg-slate-950 font-mono text-xs"
                    />
                  </FieldRow>

                  <FieldRow label="og:site URL" error={fieldErrors.ogSiteUrl}>
                    <Input
                      value={form.ogSiteUrl}
                      onChange={(event) => update('ogSiteUrl', event.target.value)}
                      placeholder="https://sealify.ng"
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>

                <FieldRow label="og:image:alt" hint="Describes the share image for screen readers">
                  <Input
                    value={form.ogImageAlt}
                    onChange={(event) => update('ogImageAlt', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <Separator className="bg-slate-800" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow label="Twitter card type" error={fieldErrors.twitterCard}>
                    <Select
                      value={form.twitterCard}
                      onValueChange={(value) =>
                        update('twitterCard', value as SiteMetadata['twitterCard'])
                      }
                    >
                      <SelectTrigger className="bg-slate-950 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                        <SelectItem value="summary">summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="X / Twitter image" error={fieldErrors.twitterImage}>
                    <Input
                      value={form.twitterImage}
                      onChange={(event) => update('twitterImage', event.target.value)}
                      placeholder={form.ogImage}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow label="@handle" error={fieldErrors.twitterSiteHandle} hint="Without the @">
                    <Input
                      value={form.twitterSiteHandle}
                      onChange={(event) => update('twitterSiteHandle', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                  <FieldRow label="Creator @handle" error={fieldErrors.twitterCreatorHandle}>
                    <Input
                      value={form.twitterCreatorHandle}
                      onChange={(event) => update('twitterCreatorHandle', event.target.value)}
                      className="bg-slate-950 text-sm"
                    />
                  </FieldRow>
                </div>

                <FieldRow label="Twitter title" error={fieldErrors.twitterTitle}>
                  <Input
                    value={form.twitterTitle}
                    onChange={(event) => update('twitterTitle', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>

                <FieldRow label="Twitter description" error={fieldErrors.twitterDescription}>
                  <Textarea
                    rows={2}
                    value={form.twitterDescription}
                    onChange={(event) => update('twitterDescription', event.target.value)}
                    className="bg-slate-950 text-sm"
                  />
                </FieldRow>
              </CardContent>
            </Card>
          )}

          {section === 'pages' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                    <Globe className="h-4 w-4" />
                  </span>
                  Page titles &amp; descriptions
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Per-route overrides for titles, meta descriptions and share copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold"
                    onClick={() => applyToAllPages({ description: form.metaDescriptionHome })}
                  >
                    Copy homepage description to all pages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold"
                    onClick={() => applyToAllPages({ ogImage: form.ogImage })}
                  >
                    Copy share image to all pages
                  </Button>
                </div>

                {previewPages.map((page) => {
                  const override = pageOverride(page.path);
                  const isHome = page.path === '/';

                  return (
                    <details
                      key={page.path}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 open:border-emerald-500/30"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white">
                        <span className="flex items-center gap-2">
                          {isHome ? (
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          {page.label}
                          <span className="font-mono text-[10px] font-normal text-slate-500">
                            {page.path}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {Object.keys(override).length > 0 && (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                              Custom
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              setPreviewPath(page.path);
                            }}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400"
                          >
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                        </span>
                      </summary>

                      <div className="space-y-3 border-t border-slate-800 px-4 py-3">
                        {isHome && (
                          <p className="text-[10px] text-slate-500">
                            The homepage title and description are edited under &ldquo;Search&rdquo;.
                          </p>
                        )}

                        <FieldRow label="Page title" error={fieldErrors[`pageMetadata.${page.path}.title`]}>
                          <Input
                            value={override.title || ''}
                            onChange={(event) => updatePageOverride(page.path, { title: event.target.value })}
                            placeholder={`Leave empty to use "${page.defaultTitle}"`}
                            className="bg-slate-900 text-sm"
                          />
                        </FieldRow>

                        <FieldRow
                          label="Meta description"
                          error={fieldErrors[`pageMetadata.${page.path}.description`]}
                        >
                          <Textarea
                            rows={2}
                            value={override.description || ''}
                            onChange={(event) =>
                              updatePageOverride(page.path, { description: event.target.value })
                            }
                            placeholder={page.defaultDescription}
                            className="bg-slate-900 text-sm"
                          />
                        </FieldRow>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FieldRow label="og:title override">
                            <Input
                              value={override.ogTitle || ''}
                              onChange={(event) =>
                                updatePageOverride(page.path, { ogTitle: event.target.value })
                              }
                              className="bg-slate-900 text-sm"
                            />
                          </FieldRow>
                          <FieldRow label="og:image override">
                            <Input
                              value={override.ogImage || ''}
                              onChange={(event) =>
                                updatePageOverride(page.path, { ogImage: event.target.value })
                              }
                              placeholder="Uses the global share image"
                              className="bg-slate-900 text-sm"
                            />
                          </FieldRow>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <label className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Switch
                              checked={override.noIndex === true}
                              onCheckedChange={(checked) =>
                                updatePageOverride(page.path, { noIndex: checked })
                              }
                            />
                            Hide this page from search engines
                          </label>

                          {Object.keys(override).length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => clearPageOverride(page.path)}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="h-3 w-3" /> Clear overrides
                            </Button>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {section === 'audit' && (
            <>
              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                    <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    SEO audit
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Scores every managed route against title, description, share image and
                    indexing rules. Updates as you type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {audits.map((audit) => (
                    <AuditRow
                      key={audit.path}
                      audit={audit}
                      onPreview={(path) => {
                        setPreviewPath(path);
                      }}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                    <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-2 text-emerald-400">
                      <FileJson className="h-4 w-4" />
                    </span>
                    Configuration export / import
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Move branding between environments or keep a backup. Imported values are
                    validated before they can be saved.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-[10px] font-bold" onClick={handleExport}>
                    <Download className="h-3.5 w-3.5" /> Download JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold"
                    disabled={importing}
                    onClick={() => importInput.current?.click()}
                  >
                    {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Import JSON
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-bold text-slate-400"
                    disabled={resetting}
                    onClick={() => void handleReset('all')}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset everything
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Preview rail */}
        <aside className="space-y-4 2xl:sticky 2xl:top-6 2xl:self-start">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-black text-white">
                <Eye className="h-4 w-4 text-emerald-400" /> Live preview
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Exactly what the edge will serve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Preview route
                </Label>
                <Select value={previewPath} onValueChange={setPreviewPath}>
                  <SelectTrigger className="bg-slate-950 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {previewPages.map((page) => (
                      <SelectItem key={page.path} value={page.path}>
                        {page.label} — {page.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <BrowserPreview resolved={preview} />

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <Search className="h-3 w-3" /> Google result
                </p>
                <GooglePreview resolved={preview} />
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <Smartphone className="h-3 w-3" /> WhatsApp preview
                </p>
                <SocialPreview resolved={preview} />
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <Monitor className="h-3 w-3" /> X / Twitter card
                </p>
                <SocialPreview resolved={preview} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[10px] font-bold"
                  onClick={() => setShowHeadTags((current) => !current)}
                >
                  {showHeadTags ? 'Hide' : 'Show'} head tags
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[10px] font-bold"
                  onClick={() => window.open(previewPath, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" /> Open
                </Button>
              </div>

              {showHeadTags && (
                <div className="space-y-2">
                  <pre className="max-h-64 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] leading-relaxed text-emerald-300">
                    {buildHeadHtml(preview)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] font-bold"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(buildHeadHtml(preview))
                        .then(() => toast.success('Head tags copied'))
                        .catch(() => toast.error('Clipboard unavailable'));
                    }}
                  >
                    <Copy className="h-3 w-3" /> Copy head tags
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="space-y-2 pt-6 text-[11px] leading-relaxed text-slate-400">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                How this reaches users
              </p>
              <p className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                Crawlers read these tags from the server, so WhatsApp and Google see your edits
                without JavaScript.
              </p>
              <p className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                The edge cache is purged on save; changes appear on the next request.
              </p>
              <p className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                robots.txt and sitemap.xml are generated from these same settings.
              </p>
              <p className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                Every save is written to the audit log with the list of changed fields.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={(element) => {
          fileInputs.current.favicon = element;
        }}
        type="file"
        accept={ASSET_RULES.favicon.accept}
        className="hidden"
        onChange={(event) => {
          void handleFile('favicon', event.target.files?.[0], 'faviconUrl');
          event.target.value = '';
        }}
      />
      <input
        ref={(element) => {
          fileInputs.current.logo = element;
        }}
        type="file"
        accept={ASSET_RULES.logo.accept}
        className="hidden"
        onChange={(event) => {
          void handleFile('logo', event.target.files?.[0], 'logoUrl');
          event.target.value = '';
        }}
      />
      <input
        ref={(element) => {
          fileInputs.current.og = element;
        }}
        type="file"
        accept={ASSET_RULES.og.accept}
        className="hidden"
        onChange={(event) => {
          void handleFile('og', event.target.files?.[0], 'ogImage');
          event.target.value = '';
        }}
      />
      <input
        ref={importInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          void handleImport(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default SeoBrandingEditor;