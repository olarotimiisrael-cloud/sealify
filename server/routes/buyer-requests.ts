import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const buyerRequestsRouter = Router();

buyerRequestsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { category, status = "open", limit = "20", offset = "0" } = req.query;

    let whereClause = "WHERE status = $1";
    const params: any[] = [status as string];
    let paramIndex = 2;

    if (category && category !== "All") { whereClause += ` AND category_id = $${paramIndex}`; params.push(category); paramIndex++; }

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const requests = await sql`SELECT * FROM buyer_requests ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

buyerRequestsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { title, category_id, max_budget, location, description } = req.body;

    if (!title || !category_id || !max_budget || !location || !description) {
      throw new AppError('All fields are required', 400);
    }

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const result = await sql`INSERT INTO buyer_requests (user_id, user_name, user_avatar, title, category_id, max_budget, location, description, status, created_at, updated_at) VALUES (${user.id}, ${profile[0]?.full_name || 'User'}, ${profile[0]?.avatar_url || null}, ${title}, ${category_id}, ${max_budget}, ${location}, ${description}, 'open', NOW(), NOW()) RETURNING *`;

    res.json({ request: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

buyerRequestsRouter.post('/:id/respond', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const requestId = req.params.id;
    const { proposed_price, message } = req.body;

    if (!proposed_price) throw new AppError('Proposed price is required', 400);

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const request = await sql`SELECT * FROM buyer_requests WHERE id = ${requestId} AND status = 'open'`;
    if (request.length === 0) throw new AppError('Request not found or closed', 404);

    const result = await sql`INSERT INTO buyer_request_responses (request_id, seller_id, seller_name, seller_avatar, proposed_price, message, status, created_at) VALUES (${requestId}, ${user.id}, ${profile[0]?.full_name || 'Seller'}, ${profile[0]?.avatar_url || null}, ${proposed_price}, ${message || null}, 'pending', NOW()) RETURNING *`;

    await sql`UPDATE buyer_requests SET status = 'responded', responses_count = responses_count + 1 WHERE id = ${requestId}`;
    await sql`INSERT INTO notifications (user_id, type, title, description, link_url, created_at) VALUES (${request[0].user_id}, 'offer', 'New Offer on Your Request', 'A seller responded to your request', '/requests', NOW())`;

    res.json({ response: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

buyerRequestsRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const requestId = req.params.id;
    const { status } = req.body;

    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) throw new AppError('Not authorized', 403);

    await sql`UPDATE buyer_requests SET status = ${status}, updated_at = NOW() WHERE id = ${requestId}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

buyerRequestsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const requestId = req.params.id;

    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) throw new AppError('Not authorized', 403);

    await sql`DELETE FROM buyer_requests WHERE id = ${requestId}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
