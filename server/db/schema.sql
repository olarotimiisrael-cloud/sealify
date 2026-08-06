-- Additional tables for analytics and offline sync
-- Run this after the main migration

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    viewport TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_session ON public.performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_name ON public.performance_metrics(metric_name);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "System can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can view analytics" ON public.analytics_events FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert performance" ON public.performance_metrics FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can view performance" ON public.performance_metrics FOR SELECT USING (public.is_admin());