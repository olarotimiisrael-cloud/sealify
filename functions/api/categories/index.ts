import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth } from '../../_middleware/auth';
import { isAdmin } from '../../_middleware/admin-service';
import type { AppContext } from '../../_middleware/types';

export const categoriesRoutes = new Hono<AppContext>();

categoriesRoutes.get('/', async (c) => {
  try {
    const sql = getSql(c.env);
    const categories = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order`;
    return c.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch categories' });
  }
});

categoriesRoutes.get('/with-subcategories', async (c) => {
  try {
    const sql = getSql(c.env);
    const categories = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order`;
    const subcategories = await sql`SELECT * FROM subcategories WHERE is_active = true ORDER BY sort_order`;
    const result = categories.map((cat: any) => ({
      ...cat,
      subcategories: subcategories.filter((sub: any) => sub.category_id === cat.id),
    }));
    return c.json({ categories: result });
  } catch (err) {
    console.error('Get categories with subcategories error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch categories' });
  }
});

categoriesRoutes.get('/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const category = await sql`SELECT * FROM categories WHERE id = ${c.req.param('id')}`;
    if (category.length === 0) throw new HTTPException(404, { message: 'Category not found' });
    return c.json({ category: category[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Get category error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch category' });
  }
});

categoriesRoutes.get('/:id/subcategories', async (c) => {
  try {
    const sql = getSql(c.env);
    const subcategories = await sql`SELECT * FROM subcategories WHERE category_id = ${c.req.param('id')} AND is_active = true ORDER BY sort_order`;
    return c.json({ subcategories });
  } catch (err) {
    console.error('Get subcategories error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch subcategories' });
  }
});

categoriesRoutes.post('/', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (!profile[0] || profile[0].role !== 'admin') throw new HTTPException(403, { message: 'Forbidden' });

    const body = await c.req.json();
    const { id, name, icon_name, color, description, parent_id, sort_order } = body;
    const result = await sql`INSERT INTO categories (id, name, icon_name, color, description, parent_id, sort_order, is_active) VALUES (${id}, ${name}, ${icon_name}, ${color}, ${description || null}, ${parent_id || null}, ${sort_order || 0}, true) RETURNING *`;
    return c.json({ category: result[0] }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Create category error:', err);
    throw new HTTPException(500, { message: 'Failed to create category' });
  }
});

categoriesRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const adminCheck = await isAdmin(user.id, c.env);
    if (!adminCheck) throw new HTTPException(403, { message: 'Forbidden' });

    const body = await c.req.json();
    const { name, icon_name, color, description, parent_id, sort_order, is_active } = body;
    const result = await sql`UPDATE categories SET name = ${name}, icon_name = ${icon_name}, color = ${color}, description = ${description}, parent_id = ${parent_id}, sort_order = ${sort_order}, is_active = ${is_active}, updated_at = NOW() WHERE id = ${c.req.param('id')} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Category not found' });
    return c.json({ category: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Update category error:', err);
    throw new HTTPException(500, { message: 'Failed to update category' });
  }
});

categoriesRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const adminCheck = await isAdmin(user.id, c.env);
    if (!adminCheck) throw new HTTPException(403, { message: 'Forbidden' });

    await sql`DELETE FROM categories WHERE id = ${c.req.param('id')}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Delete category error:', err);
    throw new HTTPException(500, { message: 'Failed to delete category' });
  }
});

export default categoriesRoutes;