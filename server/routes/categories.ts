import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const categories = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order`;
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get('/with-subcategories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const categories = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order`;
    const subcategories = await sql`SELECT * FROM subcategories WHERE is_active = true ORDER BY sort_order`;
    const result = categories.map((cat: any) => ({
      ...cat,
      subcategories: subcategories.filter((sub: any) => sub.category_id === cat.id),
    }));
    res.json({ categories: result });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const category = await sql`SELECT * FROM categories WHERE id = ${req.params.id}`;
    if (category.length === 0) throw new AppError('Category not found', 404);
    res.json({ category: category[0] });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get('/:id/subcategories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const subcategories = await sql`SELECT * FROM subcategories WHERE category_id = ${req.params.id} AND is_active = true ORDER BY sort_order`;
    res.json({ subcategories });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (!profile[0] || profile[0].role !== 'admin') throw new AppError('Forbidden', 403);

    const { id, name, icon_name, color, description, parent_id, sort_order } = req.body;
    const result = await sql`INSERT INTO categories (id, name, icon_name, color, description, parent_id, sort_order, is_active) VALUES (${id}, ${name}, ${icon_name}, ${color}, ${description || null}, ${parent_id || null}, ${sort_order || 0}, true) RETURNING *`;
    res.json({ category: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { name, icon_name, color, description, parent_id, sort_order, is_active } = req.body;
    const result = await sql`UPDATE categories SET name = ${name}, icon_name = ${icon_name}, color = ${color}, description = ${description}, parent_id = ${parent_id}, sort_order = ${sort_order}, is_active = ${is_active}, updated_at = NOW() WHERE id = ${req.params.id} RETURNING *`;
    if (result.length === 0) throw new AppError('Category not found', 404);
    res.json({ category: result[0] });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
