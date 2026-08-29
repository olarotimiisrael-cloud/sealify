import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const messagesRouter = Router();

messagesRouter.get('/conversations', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const conversations = await sql`SELECT c.*, a.title as listing_title, a.images as listing_images, a.price as listing_price, p.full_name as other_user_name, p.avatar_url as other_user_avatar FROM conversations c LEFT JOIN ads a ON c.ad_id = a.id LEFT JOIN profiles p ON (CASE WHEN c.participant_1 = ${user.id} THEN c.participant_2 = p.id ELSE c.participant_1 = p.id END) WHERE c.participant_1 = ${user.id} OR c.participant_2 = ${user.id} ORDER BY c.updated_at DESC`;
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

messagesRouter.get('/conversations/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const conversationId = req.params.id;

    const conv = await sql`SELECT * FROM conversations WHERE id = ${conversationId} AND (participant_1 = ${user.id} OR participant_2 = ${user.id})`;
    if (conv.length === 0) throw new AppError('Conversation not found', 404);

    const messages = await sql`SELECT m.*, p.full_name as sender_name, p.avatar_url as sender_avatar FROM messages m LEFT JOIN profiles p ON m.sender_id = p.id WHERE m.conversation_id = ${conversationId} ORDER BY m.created_at ASC`;
    await sql`UPDATE messages SET read = true WHERE conversation_id = ${conversationId} AND receiver_id = ${user.id}`;

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

messagesRouter.post('/conversations', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { ad_id, receiver_id, content } = req.body;

    if (!ad_id || !receiver_id || !content) throw new AppError('ad_id, receiver_id, and content are required', 400);

    const conversation = await sql`SELECT * FROM conversations WHERE ad_id = ${ad_id} AND ((participant_1 = ${user.id} AND participant_2 = ${receiver_id}) OR (participant_1 = ${receiver_id} AND participant_2 = ${user.id}))`;

    let conversationId: string;

    if (conversation.length === 0) {
      const result = await sql`INSERT INTO conversations (ad_id, participant_1, participant_2, last_message, last_message_time, created_at, updated_at) VALUES (${ad_id}, ${user.id}, ${receiver_id}, ${content}, NOW(), NOW(), NOW()) RETURNING id`;
      conversationId = result[0].id;
    } else {
      conversationId = conversation[0].id;
      await sql`UPDATE conversations SET last_message = ${content}, last_message_time = NOW(), updated_at = NOW() WHERE id = ${conversationId}`;
    }

    const messageResult = await sql`INSERT INTO messages (conversation_id, sender_id, receiver_id, ad_id, content, status, read, created_at) VALUES (${conversationId}, ${user.id}, ${receiver_id}, ${ad_id}, ${content}, 'sent', false, NOW()) RETURNING *`;
    await sql`INSERT INTO notifications (user_id, type, title, description, link_url, created_at) VALUES (${receiver_id}, 'message', 'New Message', 'You have a new message', '/messages', NOW())`;

    res.json({ message: messageResult[0], conversationId }, 201);
  } catch (err) {
    next(err);
  }
});

messagesRouter.put('/conversations/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const conversationId = req.params.id;

    await sql`UPDATE messages SET read = true WHERE conversation_id = ${conversationId} AND receiver_id = ${user.id}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
