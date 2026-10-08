-- ============================================================
-- SAVED SEARCHES AND ALERTS FOR SEALIFY MARKETPLACE
-- ============================================================

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    search_query TEXT, -- Stores the search parameters as JSON string
    category VARCHAR(100),
    location VARCHAR(255),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly
    last_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON public.saved_searches(is_active);
CREATE INDEX IF NOT EXISTS idx_saved_searches_category ON public.saved_searches(category);
CREATE INDEX IF NOT EXISTS idx_saved_searches_location ON public.saved_searches(location);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.saved_searches IS 'User saved searches for marketplace alerts';
COMMENT ON COLUMN public.saved_searches.user_id IS 'Reference to the user who saved the search';
COMMENT ON COLUMN public.saved_searches.name IS 'User-defined name for the saved search';
COMMENT ON COLUMN public.saved_searches.search_query IS 'Serialized search parameters (JSON)';
COMMENT ON COLUMN public.saved_searches.category IS 'Product category filter';
COMMENT ON COLUMN public.saved_searches.location IS 'Geographic location filter';
COMMENT ON COLUMN public.saved_searches.min_price IS 'Minimum price filter';
COMMENT ON COLUMN public.saved_searches.max_price IS 'Maximum price filter';
COMMENT ON COLUMN public.saved_searches.is_active IS 'Whether the search alert is active';
COMMENT ON COLUMN public.saved_searches.email_notifications IS 'Whether to send email notifications';
COMMENT ON COLUMN public.saved_searches.frequency IS 'Notification frequency (immediate, daily, weekly)';
COMMENT ON COLUMN public.saved_searches.last_notified_at IS 'Timestamp of last notification sent';
COMMENT ON COLUMN public.saved_searches.created_at IS 'Timestamp when search was saved';
COMMENT ON COLUMN public.saved_searches.updated_at IS 'Timestamp when search was last updated';