import type { APIRoute } from 'astro';
import { getSql } from '@/db/hyperdrive';
import { supabaseAdmin } from '@/db/supabase';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get user ID from locals (set by auth middleware)
    const userId = locals.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all saved searches for the user
    const { data: searches, error } = await supabaseAdmin
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify({ searches }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get user ID from locals (set by auth middleware)
    const userId = locals.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const {
      name,
      searchQuery,
      category,
      location,
      minPrice,
      maxPrice,
      emailNotifications = true,
      frequency = 'immediate'
    } = body;

    // Validate required fields
    if (!name || !searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Name and search query are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the saved search
    const { data: search, error } = await supabaseAdmin
      .from('saved_searches')
      .insert({
        user_id: userId,
        name,
        search_query: JSON.stringify(searchQuery),
        category: category || null,
        location: location || null,
        min_price: minPrice !== null && minPrice !== undefined ? minPrice : null,
        max_price: maxPrice !== null && maxPrice !== undefined ? maxPrice : null,
        email_notifications: emailNotifications,
        frequency
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ search }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating saved search:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Get user ID from locals (set by auth middleware)
    const userId = locals.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchId } = await request.json();
    const body = await request.json();
    
    if (!searchId) {
      return new Response(
        JSON.stringify({ error: 'Search ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.searchQuery !== undefined) updateData.search_query = JSON.stringify(body.searchQuery);
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.minPrice !== undefined) updateData.min_price = body.minPrice !== null ? body.minPrice : null;
    if (body.maxPrice !== undefined) updateData.max_price = body.maxPrice !== null ? body.maxPrice : null;
    if (body.emailNotifications !== undefined) updateData.email_notifications = body.emailNotifications;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    // Update the saved search
    const { data: search, error } = await supabaseAdmin
      .from('saved_searches')
      .update(updateData)
      .eq('id', searchId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!search) {
      return new Response(
        JSON.stringify({ error: 'Saved search not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ search }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating saved search:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    // Get user ID from locals (set by auth middleware)
    const userId = locals.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchId } = await request.json();
    
    if (!searchId) {
      return new Response(
        JSON.stringify({ error: 'Search ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the saved search
    const { error } = await supabaseAdmin
      .from('saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', userId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Test email notification endpoint
export const POST_TEST_EMAIL: APIRoute = async ({ request, locals }) => {
  try {
    // Get user ID from locals (set by auth middleware)
    const userId = locals.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { searchId, testEmail } = body;
    
    if (!searchId) {
      return new Response(
        JSON.stringify({ error: 'Search ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the search details
    const { data: search, error: searchError } = await supabaseAdmin
      .from('saved_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', userId)
      .single();

    if (searchError) throw searchError;
    if (!search) {
      return new Response(
        JSON.stringify({ error: 'Saved search not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    const recipientEmail = testEmail || userData.email;
    
    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'No email address available' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert email into outbox for processing
    const { data: emailData, error: emailError } = await supabaseAdmin
      .from('email_outbox')
      .insert({
        template: 'search-alert',
        recipient: recipientEmail,
        payload: JSON.stringify({
          searchName: search.name,
          searchCriteria: {
            category: search.category,
            location: search.location,
            minPrice: search.minPrice,
            maxPrice: search.maxPrice,
          },
          matchCount: Math.floor(Math.random() * 5) + 1, // Simulate some matches
          searchId: search.id,
          userId: userId
        }),
        status: 'pending',
        scheduled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test notification queued for sending',
        emailId: emailData.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};