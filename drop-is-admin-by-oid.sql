-- Get the OID and drop the function
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT oid FROM pg_proc WHERE proname = 'is_admin' LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS pg_proc::oid(%L) CASCADE', r.oid);
  END LOOP;
END $$;

-- Just recreate what we need
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';