-- Drop all is_admin functions by iterating through them
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT oid, proname, proargtypes::text FROM pg_proc WHERE proname = 'is_admin' LOOP
    EXECUTE format('DROP FUNCTION %s(%s)', r.proname, r.proargtypes);
  END LOOP;
END $$;
