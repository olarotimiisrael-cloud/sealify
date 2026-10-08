const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://eliwjdafimaugnwvadlr.supabase.co';
const ANON_KEY = 'sb_publishable_h4te__ofhyf2Ou5uALG-Sw_lsKjDQR7';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function createBuckets() {
  const buckets = [
    { name: 'profile-media', public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-images', public: true, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-videos', public: true, fileSizeLimit: 52428800, allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'] },
    { name: 'documents', public: false, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] },
    { name: 'messages', public: false, fileSizeLimit: null, allowedMimeTypes: null }
  ];

  console.log('Creating storage buckets...\n');

  for (const bucket of buckets) {
    console.log(`Creating bucket: ${bucket.name}...`);
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ~ Already exists: ${bucket.name}\n`);
        } else {
          console.log(`  ❌ Error: ${error.message}\n`);
        }
      } else {
        console.log(`  ✓ Created: ${bucket.name}\n`);
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}\n`);
    }
  }

  console.log('Done. Now test with an actual upload...');
}

createBuckets();