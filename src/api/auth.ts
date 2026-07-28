import { Hono } from "hono";
import { getSql, queryDb, queryOneDb, executeDb } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const authRoutes = new Hono();

// Initialize Supabase client for auth operations
function getSupabaseClient(env: any) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// Register new user
authRoutes.post("/register", async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { email, password, fullName, phoneNumber } = body;

    if (!email || !password || !fullName) {
      return c.json({ error: "Email, password, and full name are required" }, 400);
    }

    const supabase = getSupabaseClient(env);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phoneNumber,
        }
      }
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create profile in database
    const sql = getSql(env);
    const userId = authData.user.id;
    
    await sql`
      INSERT INTO users (id, email, full_name, phone_number, role, status, location, verified, verification_type, created_at, updated_at)
      VALUES (${userId}, ${email}, ${fullName}, ${phoneNumber || null}, 'buyer', 'active', 'Ogbomoso, Oyo State', false, 'none', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        updated_at = NOW()
    `;

    return c.json({
      user: {
        id: userId,
        email,
        fullName,
        phoneNumber,
        role: "buyer",
        verified: false
      },
      session: authData.session
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Login
authRoutes.post("/login", async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getSupabaseClient(env);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    // Get user profile from database
    const sql = getSql(env);
    const profile = await sql`
      SELECT * FROM users WHERE id = ${data.user.id}
    `;

    return c.json({
      user: profile[0] || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        role: "buyer"
      },
      session: data.session
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get current user profile
authRoutes.get("/me", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient(env);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const sql = getSql(env);
    const profile = await sql`
      SELECT * FROM users WHERE id = ${user.id}
    `;

    return c.json({ user: profile[0] || null });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// Update user profile
authRoutes.put("/profile", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient(env);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const body = await c.req.json();
    const sql = getSql(env);
    
    const allowedFields = [
      'full_name', 'phone_number', 'avatar_url', 'store_banner_url',
      'bio', 'location', 'business_name', 'cac_number', 'business_hours',
      'bank_name', 'account_number', 'account_name',
      'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number',
      'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    await sql`
      UPDATE users SET 
        ${sql(updates)}
      WHERE id = ${user.id}
    `;

    const updated = await sql`SELECT * FROM users WHERE id = ${user.id}`;
    return c.json({ user: updated[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Logout
authRoutes.post("/logout", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient(env);
    
    await supabase.auth.signOut();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});