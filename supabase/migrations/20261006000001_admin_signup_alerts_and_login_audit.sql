-- =============================================================
-- Sealify: admin new-user signup alerts + admin login audit log
-- =============================================================
-- Adds:
--   * admin_signup_alerts   (one row per new user registration; admins
--                            are notified so they can follow up by phone)
--   * admin_login_sessions  (detailed activity log for every admin login:
--                            time, geo, browser, device, IP, access method,
--                            session duration and current status)
--   * profiles.last_login_at / last_login_ip (best-effort denormalized
--            pointers used to compute live session duration)
-- All new tables get RLS policies so no client can read/write them
-- through PostgREST. They are written only by server code via
-- service-role / Hyperdrive connections.
-- =============================================================

-- =============================================================
-- 1. profiles: last-login pointers -----------------------------
-- =============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_login_at   timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_ip   inet;

COMMENT ON COLUMN public.profiles.last_login_at IS
  'Timestamp of the most recent successful administrator login for this profile. Denormalized convenience pointer; the authoritative session history lives in admin_login_sessions.';

COMMENT ON COLUMN public.profiles.last_login_ip IS
  'IP address of the most recent successful administrator login.';

-- =============================================================
-- 2. admin_signup_alerts --------------------------------------
-- =============================================================
CREATE TABLE public.admin_signup_alerts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email            text NOT NULL,
  full_name        text,
  phone_number     text,
  location         text,
  role             text NOT NULL DEFAULT 'buyer',
  signup_channel   text NOT NULL DEFAULT 'email',
  ip_address       inet,
  user_agent       text,
  follow_up_status text NOT NULL DEFAULT 'pending'
                    CHECK (follow_up_status IN ('pending', 'called', 'notified', 'dismissed')),
  follow_up_note   text,
  follow_up_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_signup_alerts IS
  'Alert queue for every new user registration. Administrators are notified in real time so they can make timely follow-up calls.';

CREATE INDEX idx_admin_signup_alerts_created
  ON public.admin_signup_alerts (created_at DESC);

CREATE INDEX idx_admin_signup_alerts_status
  ON public.admin_signup_alerts (follow_up_status, created_at DESC);

-- =============================================================
-- 3. admin_login_sessions -------------------------------------
-- =============================================================
CREATE TABLE public.admin_login_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email            text NOT NULL,
  login_at         timestamptz NOT NULL DEFAULT now(),
  logout_at        timestamptz,
  ip_address       inet,
  country          text,
  region           text,
  city             text,
  latitude         double precision,
  longitude        double precision,
  browser_name     text,
  browser_version  text,
  os_name          text,
  os_version       text,
  device_type      text,
  device_brand     text,
  device_model     text,
  access_method    text NOT NULL DEFAULT 'password'
                    CHECK (access_method IN ('password', 'oauth', 'otp', 'magic_link', 'passwordless')),
  session_token_id text,
  user_agent       text,
  session_duration_seconds integer,
  status           text NOT NULL DEFAULT 'logged_in'
                    CHECK (status IN ('logged_in', 'logged_out', 'expired', 'force_terminated')),
  last_activity_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_login_sessions IS
  'Detailed activity log for every administrator login session. Captures time, geographic location, browser details, IP address, device type, access method, session duration and current activity status.';

CREATE INDEX idx_admin_login_sessions_admin
  ON public.admin_login_sessions (admin_id, login_at DESC);

CREATE INDEX idx_admin_login_sessions_status
  ON public.admin_login_sessions (status, login_at DESC);

CREATE INDEX idx_admin_login_sessions_login_at
  ON public.admin_login_sessions (login_at DESC);

-- =============================================================
-- 4. RLS policies ---------------------------------------------
-- =============================================================
ALTER TABLE public.admin_signup_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_sessions     ENABLE ROW LEVEL SECURITY;

-- No client-side reads or writes at all (server-only via Hyperdrive /
-- service-role connections).
CREATE POLICY admin_signup_alerts_no_client_access
  ON public.admin_signup_alerts
  AS RESTRICTIVE FOR ALL
  USING (false);

CREATE POLICY admin_login_sessions_no_client_access
  ON public.admin_login_sessions
  AS RESTRICTIVE FOR ALL
  USING (false);

-- =============================================================
-- 5. updated_at trigger ---------------------------------------
-- =============================================================
DROP TRIGGER IF EXISTS set_updated_at ON public.admin_login_sessions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.admin_login_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();