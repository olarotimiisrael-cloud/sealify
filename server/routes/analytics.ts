import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAdmin);

analyticsRouter.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const [totalUsers, activeUsers, totalAds, activeAds, totalRevenue, pendingReports, pendingDisputes, pendingVerifications] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM profiles`,
      sql`SELECT COUNT(*) as count FROM profiles WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days'`,
      sql`SELECT COUNT(*) as count FROM ads`,
      sql`SELECT COUNT(*) as count FROM ads WHERE status = 'active'`,
      sql`SELECT SUM(amount) as total FROM promotion_payments WHERE status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM disputes WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'`,
    ]);
    res.json({
      users: { total: totalUsers[0]?.count || 0, active: activeUsers[0]?.count || 0 },
      ads: { total: totalAds[0]?.count || 0, active: activeAds[0]?.count || 0 },
      revenue: totalRevenue[0]?.total || 0,
      pending: { reports: pendingReports[0]?.count || 0, disputes: pendingDisputes[0]?.count || 0, verifications: pendingVerifications[0]?.count || 0 },
    });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/users/growth', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { days = "30" } = req.query;
    const growth = await sql`SELECT DATE(created_at) as date, COUNT(*) as new_users FROM profiles WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date ASC`;
    res.json({ growth });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/ads/performance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const performance = await sql`SELECT category_id as category, COUNT(*) as total_ads, AVG(price) as avg_price, SUM(views_count) as total_views, COUNT(*) FILTER (WHERE status = 'sold') as sold_count FROM ads WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY category_id ORDER BY total_ads DESC`;
    res.json({ performance });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { days = "30" } = req.query;
    const revenue = await sql`SELECT DATE(created_at) as date, SUM(amount) as daily_revenue, COUNT(*) as promotion_count FROM promotion_payments WHERE status = 'approved' AND created_at > NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date ASC`;
    res.json({ revenue });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const categories = await sql`SELECT c.name as category, COUNT(a.id) as total_ads, AVG(a.price) as avg_price, SUM(a.views_count) as total_views FROM categories c LEFT JOIN ads a ON a.category_id = c.id AND a.status = 'active' WHERE c.is_active = true GROUP BY c.id, c.name ORDER BY total_ads DESC`;
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { event, limit = "100", offset = "0" } = req.query;
    let whereClause = "";
    const params: any[] = [];
    let paramIndex = 1;
    if (event) { whereClause = `WHERE event_name = $${paramIndex}`; params.push(event); paramIndex++; }
    const limitNum = Math.min(parseInt(limit as string) || 100, 500);
    const offsetNum = parseInt(offset as string) || 0;
    const events = await sql`SELECT * FROM analytics_events ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/performance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { metric, limit = "100" } = req.query;
    let whereClause = "";
    const params: any[] = [];
    if (metric) { whereClause = `WHERE metric_name = $1`; params.push(metric); }
    const limitNum = Math.min(parseInt(limit as string) || 100, 500);
    const metrics = await sql`SELECT metric_name, AVG(value) as avg_value, COUNT(*) as samples, COUNT(*) FILTER (WHERE rating = 'good') as good_count, COUNT(*) FILTER (WHERE rating = 'needs-improvement') as needs_improvement_count, COUNT(*) FILTER (WHERE rating = 'poor') as poor_count FROM performance_metrics ${sql(whereClause)} GROUP BY metric_name ORDER BY avg_value DESC LIMIT ${limitNum}`;
    res.json({ metrics });
  } catch (err) {
    next(err);
  }
});
