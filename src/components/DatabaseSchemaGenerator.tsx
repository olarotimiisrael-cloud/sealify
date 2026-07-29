// ... existing code ...
            { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
            { name: 'logo_url', type: 'TEXT', constraints: '' },
            { name: 'site_name', type: 'TEXT', constraints: "DEFAULT 'Sealify Nigeria'" },
            { name: 'site_description', type: 'TEXT', constraints: "DEFAULT 'Nigeria\\'s Trusted Local Marketplace.'" },
            { name: 'og_image', type: 'TEXT', constraints: '' },
            { name: 'contact_email', type: 'TEXT', constraints: '' },
            { name: 'contact_phone', type: 'TEXT', constraints: '' },
            { name: 'updated_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()' },
          ],
// ... existing code ...