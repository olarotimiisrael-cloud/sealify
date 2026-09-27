-- Drop all is_admin functions by OID
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT oid FROM pg_proc WHERE proname = 'is_admin' LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.is_admin CASCADE');
  END LOOP;
END $$;

-- Verify none remain
SELECT count(*) as remaining FROM pg_proc WHERE proname = 'is_admin';
