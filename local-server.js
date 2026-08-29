import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Service role client for admin operations (bypasses RLS)
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : supabase;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));
app.use(express.json());

// Helper to get user from Authorization header
async function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Helper to check if user is admin
async function isAdmin(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error || !data) return false;
  return data.role === 'admin';
}

// ==================== AUTH ROUTES ====================

// Admin login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: 'Unable to authenticate administrator' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return res.status(401).json({ message: 'Unable to authenticate administrator' });
    }

    const admin = await isAdmin(data.user.id);
    if (!admin) {
      await supabase.auth.signOut();
      return res.status(401).json({ message: 'Unable to authenticate administrator' });
    }

    res.json({ session: data.session });
  } catch (err) {
    res.status(401).json({ message: 'Unable to authenticate administrator' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ message: error.message });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        role: 'buyer'
      },
      session: data.session
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phoneNumber }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Create profile
    await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone_number: phoneNumber || null,
      role: 'buyer',
      status: 'active',
      location: 'Ogbomoso, Oyo State',
      verified: false,
      verification_type: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Create user settings
    await supabaseAdmin.from('user_settings').insert({
      user_id: authData.user.id,
      email_notifications: true,
      whatsapp_notifications: true,
      push_notifications: true,
      price_drop_alerts: true,
      new_message_alerts: true,
      weekly_digest: true,
      promotion_expiry_reminders: true,
      language: 'en',
      theme: 'dark',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    res.status(201).json({
      user: {
        id: authData.user.id,
        email,
        fullName,
        phoneNumber,
        role: 'buyer',
        verified: false,
      },
      session: authData.session
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Get current user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user: profile || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Update profile
app.put('/api/auth/profile', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [usersResult, listingsResult, promotionsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
      supabaseAdmin.from('ads').select('id', { count: 'exact' }),
      supabaseAdmin.from('ads').select('id', { count: 'exact' }).eq('payment_status', 'approved')
    ]);

    res.json({
      totalUsers: usersResult.count || 0,
      totalListings: listingsResult.count || 0,
      totalPromotions: promotionsResult.count || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

// Admin users
app.get('/api/admin/users', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Admin listings
app.get('/api/admin/listings', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get listings' });
  }
});

// Admin promotions
app.get('/api/admin/promotions', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*)')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ promotions: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get promotions' });
  }
});

// Admin approve promotion
app.post('/api/admin/promotions/:id/approve', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { error } = await supabaseAdmin
      .from('ads')
      .update({ payment_status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve promotion' });
  }
});

// Admin reject promotion
app.post('/api/admin/promotions/:id/reject', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { error } = await supabaseAdmin
      .from('ads')
      .update({ payment_status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject promotion' });
  }
});

// Admin audit logs
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ logs: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get audit logs' });
  }
});

// Admin intrusion logs
app.get('/api/admin/intrusion-logs', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('intrusion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ logs: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get intrusion logs' });
  }
});

// ==================== LISTINGS ROUTES ====================

app.get('/api/listings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*), ad_images(image_url, sort_order)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*), ad_images(image_url, sort_order)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get listing' });
  }
});

// ==================== ANALYTICS ROUTES ====================

app.get('/api/analytics/overview', async (req, res) => {
  try {
    const [usersResult, listingsResult, activeListingsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
      supabaseAdmin.from('ads').select('id', { count: 'exact' }),
      supabaseAdmin.from('ads').select('id', { count: 'exact' }).eq('status', 'active')
    ]);

    res.json({
      totalUsers: usersResult.count || 0,
      totalListings: listingsResult.count || 0,
      activeListings: activeListingsResult.count || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get analytics' });
  }
});

// ==================== MESSAGES ROUTES ====================

app.get('/api/messages/conversations', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_time', { ascending: false });

    if (error) throw error;
    res.json({ conversations: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get conversations' });
  }
});

app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ messages: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// ==================== NOTIFICATIONS ROUTES ====================

app.get('/api/notifications', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({
      notifications: data,
      unreadCount: data?.filter(n => !n.read).length || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// ==================== SEARCH ROUTES ====================

app.get('/api/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, condition, location } = req.query;
    let query = supabase
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*)')
      .eq('status', 'active');

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (category) query = query.eq('category_id', category);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (condition) query = query.eq('condition', condition);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ results: data });
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
});

app.get('/api/search/trending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*, profiles!ads_seller_id_fkey(*)')
      .eq('status', 'active')
      .order('views_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ trending: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get trending' });
  }
});

// ==================== USERS ROUTES ====================

app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// ==================== CATEGORIES ROUTES ====================

app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ categories: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get categories' });
  }
});

// ==================== REVIEWS ROUTES ====================

app.get('/api/reviews/:listingId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_reviewer_id_fkey(*)')
      .eq('ad_id', req.params.listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ reviews: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...req.body,
        reviewer_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ review: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sealify API server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using ${supabaseAdmin === supabase ? 'anon' : 'service role'} key for admin operations`);
});
