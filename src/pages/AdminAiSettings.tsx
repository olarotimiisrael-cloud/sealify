import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, RefreshCcw, Save, Shield, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSealify } from '@/context/SealifyContext';
import { adminFetch } from '@/lib/admin-api';

const providerOptions = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
];

const getModelOptions = (provider: string) => {
  if (provider === 'openai') {
    return ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'];
  }
  return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
};

type AiSettingsResponse = {
  provider: 'gemini' | 'openai';
  enabled: boolean;
  model: string;
  webSearchEnabled: boolean;
  maxRequestLength: number;
  perUserRateLimit: number;
  dailyRequestLimit: number;
  maskedApiKey: string;
  status: string;
  lastSuccessfulConnection?: string | null;
  lastError?: string | null;
};

const emptyConfig: AiSettingsResponse = {
  provider: 'gemini',
  enabled: false,
  model: 'gemini-2.5-flash',
  webSearchEnabled: true,
  maxRequestLength: 1600,
  perUserRateLimit: 10,
  dailyRequestLimit: 500,
  maskedApiKey: '',
  status: 'disabled',
};

const AdminAiSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSealify();
  const [settings, setSettings] = useState<AiSettingsResponse>(emptyConfig);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const loadConfig = async () => {
      try {
        const response = await adminFetch('/api/admin/ai-settings');
        if (!response.ok) throw new Error('Unable to load Copilot settings');
        const data: AiSettingsResponse = await response.json();
        setSettings(data);
        setApiKey('');
      } catch (error) {
        toast.error('Unable to load AI settings');
      } finally {
        setIsLoading(false);
      }
    };

    void loadConfig();
  }, [isAdmin]);

  const providerModels = useMemo(() => getModelOptions(settings.provider), [settings.provider]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-rose-400" />
          <h1 className="text-2xl font-black">Access denied</h1>
          <p className="mt-3 text-sm text-slate-400">Only authorized administrators may manage Sealify Copilot settings.</p>
          <button onClick={() => navigate('/admin')} className="mt-6 rounded-xl bg-emerald-500 px-4 py-2 font-black text-slate-950">Return to Admin Dashboard</button>
        </div>
      </div>
    );
  }

  const handleProviderChange = (provider: 'gemini' | 'openai') => {
    setSettings((current) => ({
      ...current,
      provider,
      model: provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash',
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        provider: settings.provider,
        enabled: settings.enabled,
        model: settings.model,
        apiKey: apiKey.trim() || undefined,
        webSearchEnabled: settings.webSearchEnabled,
        maxRequestLength: Number(settings.maxRequestLength),
        perUserRateLimit: Number(settings.perUserRateLimit),
        dailyRequestLimit: Number(settings.dailyRequestLimit),
      };

      const response = await adminFetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Unable to save AI settings');
      }

      setSettings((current) => ({
        ...current,
        enabled: data.enabled ?? current.enabled,
        provider: data.provider ?? current.provider,
        model: data.model ?? current.model,
        webSearchEnabled: data.webSearchEnabled ?? current.webSearchEnabled,
        maxRequestLength: data.maxRequestLength ?? current.maxRequestLength,
        perUserRateLimit: data.perUserRateLimit ?? current.perUserRateLimit,
        dailyRequestLimit: data.dailyRequestLimit ?? current.dailyRequestLimit,
        maskedApiKey: data.maskedApiKey || current.maskedApiKey,
        status: data.status || current.status,
      }));
      setApiKey('');
      toast.success('AI provider settings saved securely.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save AI settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await adminFetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          model: settings.model,
          apiKey: apiKey.trim() || undefined,
          webSearchEnabled: settings.webSearchEnabled,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Connection test failed');
      }

      toast.success(data.message || 'Connection successful');
      setSettings((current) => ({ ...current, lastSuccessfulConnection: data.lastSuccessfulConnection || new Date().toISOString(), lastError: null }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection failed');
      setSettings((current) => ({ ...current, lastError: 'Connection failed', lastSuccessfulConnection: current.lastSuccessfulConnection }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-white">AI & Copilot</h1>
          </div>
          <button onClick={() => navigate('/admin')} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200">Back to Admin</button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-xl font-black text-white">Provider configuration</h2>
                  <p className="text-xs text-slate-400">Server-side AI settings managed only by the Sealify administrator.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Provider</label>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-1.5">
                      {providerOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleProviderChange(option.value as 'gemini' | 'openai')}
                          className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition ${settings.provider === option.value ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Copilot Status</label>
                    <button
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, enabled: !current.enabled }))}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-bold ${settings.enabled ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-950 text-slate-300'}`}
                    >
                      <span>{settings.enabled ? 'Enabled' : 'Disabled'}</span>
                      <span className={`inline-flex h-6 w-11 items-center rounded-full p-1 ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <span className={`h-4 w-4 rounded-full bg-white transition ${settings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Model</label>
                  <select
                    value={settings.model}
                    onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 focus:border-emerald-500"
                  >
                    {providerModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">API Credential</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey || settings.maskedApiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder={settings.maskedApiKey ? 'Enter replacement credential to update' : 'Paste server-side AI credential'}
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button type="button" onClick={() => setShowApiKey((current) => !current)} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white">
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Stored credentials are never exposed to the browser after saving. Existing credentials are shown masked only.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Max Request Length</label>
                    <input type="number" value={settings.maxRequestLength} onChange={(event) => setSettings((current) => ({ ...current, maxRequestLength: Number(event.target.value || 1600) }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Per-user Rate Limit</label>
                    <input type="number" value={settings.perUserRateLimit} onChange={(event) => setSettings((current) => ({ ...current, perUserRateLimit: Number(event.target.value || 10) }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily App Limit</label>
                    <input type="number" value={settings.dailyRequestLimit} onChange={(event) => setSettings((current) => ({ ...current, dailyRequestLimit: Number(event.target.value || 500) }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSettings((current) => ({ ...current, webSearchEnabled: !current.webSearchEnabled }))}
                    className={`rounded-2xl border p-4 text-left ${settings.webSearchEnabled ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-950 text-slate-300'}`}
                  >
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Web Search / Grounding</div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{settings.webSearchEnabled ? 'Enabled' : 'Disabled'}</span>
                      <span className={`inline-flex h-6 w-11 items-center rounded-full p-1 ${settings.webSearchEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <span className={`h-4 w-4 rounded-full bg-white transition ${settings.webSearchEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </span>
                    </div>
                  </button>

                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</div>
                    <div className="text-lg font-black text-white">{settings.status}</div>
                    <div className="mt-2 text-[10px] text-slate-500">Last successful connection: {settings.lastSuccessfulConnection ? new Date(settings.lastSuccessfulConnection).toLocaleString() : 'Not connected yet'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleTestConnection} disabled={isTesting} className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-slate-700 disabled:opacity-60">
                    {isTesting ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Testing...</> : <>Test Connection</>}
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
                    {isSaving ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Saving...</> : <>Save Settings</>}
                  </button>
                </div>
              </div>
            </section>

            <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-400"><Wand2 className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-lg font-black text-white">Copilot overview</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider</div>
                  <div className="mt-2 text-lg font-black text-white">{settings.provider}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Model</div>
                  <div className="mt-2 text-lg font-black text-white">{settings.model}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credential</div>
                  <div className="mt-2 text-lg font-black text-white">{settings.maskedApiKey || 'Not configured'}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Error</div>
                  <div className="mt-2 text-sm font-bold text-rose-300">{settings.lastError || 'No errors reported'}</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAiSettingsPage;
