const SUPABASE_URL = 'https://eliwjdafimaugnwvadlr.supabase.co';
const ANON_KEY = 'sb_publishable_h4te__ofhyf2Ou5uALG-Sw_lsKjDQR7';

async function createBucket(name, options) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: name,
      name: name,
      public: options.public,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes
    })
  });
  return response.json();
}

async function main() {
  const buckets = [
    { name: 'profile-media', public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-images', public: true, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-videos', public: true, fileSizeLimit: 52428800, allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'] },
    { name: 'documents', public: false, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] },
    { name: 'messages', public: false, fileSizeLimit: null, allowedMimeTypes: null }
  ];

  for (const bucket of buckets) {
    console.log(`Creating bucket: ${bucket.name}...`);
    try {
      const result = await createBucket(bucket.name, bucket);
      if (result.id || result.message) {
        console.log(`✓ Bucket ${bucket.name} created successfully`);
      } else if (result.error) {
        console.error(`✗ Error creating ${bucket.name}:`, result.error);
      } else {
        console.log(`~ Bucket ${bucket.name} may already exist:`, result);
      }
    } catch (e) {
      console.error(`✗ Exception for ${bucket.name}:`, e.message);
    }
  }
  console.log('\nTo add RLS policies, run the SQL file:');
  console.log('  supabase/migrations/20261008000000_storage_buckets_and_policies.sql');
}

main();