import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const categoriesRoutes = new Hono();

categoriesRoutes.get("/", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const categories = await sql`
      SELECT * FROM categories
      WHERE is_active = true
      ORDER BY sort_order
    `;

    return c.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

categoriesRoutes.get("/with-subcategories", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const categories = await sql`
      SELECT * FROM categories
      WHERE is_active = true
      ORDER BY sort_order
    `;

    const subcategories = await sql`
      SELECT * FROM subcategories
      WHERE is_active = true
      ORDER BY sort_order
    `;

    const result = categories.map(cat => ({
      ...cat,
      subcategories: subcategories.filter(sub => sub.category_id === cat.id)
    }));

    return c.json({ categories: result });
  } catch (error) {
    console.error("Get categories with subs error:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

categoriesRoutes.get("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const category = await sql`SELECT * FROM categories WHERE id = ${id}`;

    if (category.length === 0) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json({ category: category[0] });
  } catch (error) {
    console.error("Get category error:", error);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

// Admin: Create category
categoriesRoutes.post("/", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    const sql = getSql(env);
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (!profile[0] || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const { id, name, icon_name, color, description, parent_id, sort_order } = body;

    const result = await sql`
      INSERT INTO categories (id, name, icon_name, color, description, parent_id, sort_order, is_active)
      VALUES (${id}, ${name}, ${icon_name}, ${color}, ${description || null}, ${parent_id || null}, ${sort_order || 0}, true)
      RETURNING *
    `;

    return c.json({ category: result[0] }, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

// Admin: Update category
categoriesRoutes.put("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await sql`
      UPDATE categories SET 
        name = ${body.name},
        icon_name = ${body.icon_name},
        color = ${body.color},
        description = ${body.description},
        parent_id = ${body.parent_id},
        sort_order = ${body.sort_order},
        is_active = ${body.is_active},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json({ category: result[0] });
  } catch (error) {
    console.error("Update category error:", error);
    return c.json({ error: "Failed to update category" }, 500);
  }
});

// Admin: Delete category
categoriesRoutes.delete("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    await sql`DELETE FROM categories WHERE id = ${id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

// Subcategories
categoriesRoutes.get("/:id/subcategories", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const subcategories = await sql`
      SELECT * FROM subcategories
      WHERE category_id = ${id} AND is_active = true
      ORDER BY sort_order
    `;

    return c.json({ subcategories });
  } catch (error) {
    console.error("Get subcategories error:", error);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});