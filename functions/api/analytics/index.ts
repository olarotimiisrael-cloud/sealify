import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAdmin } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

export const analyticsRoutes = new Hono<AppContext>();

analyticsRoutes.use('*', requireAdmin);

analyticsRoutes.get('/overview', async (c) => {
  try {
    const sql = getSql(c.env);
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
    return c.json({
      users: { total: totalUsers[0]?.count || 0, active: activeUsers[0]?.count || 0 },
      ads: { total: totalAds[0]?.count || 0, active: activeAds[0]?.count || 0 },
      revenue: totalRevenue[0]?.total || 0,
      pending: { reports: pendingReports[0]?.count || 0, disputes: pendingDisputes[0]?.count || 0, verifications: pendingVerifications[0]?.count || 0 },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch analytics overview' });
  }
});

analyticsRoutes.get('/users/growth', async (c) => {
  try {
    const sql = getSql(c.env);
    const { days = '30' } = c.req.query();
    const growth = await sql`SELECT DATE(created_at) as date, COUNT(*) as new_users FROM profiles WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date ASC`;
    return c.json({ growth });
  } catch (err) {
    console.error('Analytics users growth error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch user growth' });
  }
});

analyticsRoutes.get('/ads/performance', async (c) => {
  try {
    const sql = getSql(c.env);
    const performance = await sql`SELECT category_id as category, COUNT(*) as total_ads, AVG(price) as avg_price, SUM(views_count) as total_views, COUNT(*) FILTER (WHERE status = 'sold') as sold_count FROM ads WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY category_id ORDER BY total_ads DESC`;
    return c.json({ performance });
  } catch (err) {
    console.error('Analytics ads performance error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch ads performance' });
  }
});

analyticsRoutes.get('/revenue', async (c) => {
  try {
    const sql = getSql(c.env);
    const { days = '30' } = c.req.query();
    const revenue = await sql`SELECT DATE(created_at) as date, SUM(amount) as daily_revenue, COUNT(*) as promotion_count FROM promotion_payments WHERE status = 'approved' AND created_at > NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date ASC`;
    return c.json({ revenue });
  } catch (err) {
    console.error('Analytics revenue error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch revenue' });
  }
});

analyticsRoutes.get('/categories', async (c) => {
  try {
    const sql = getSql(c.env);
    const categories = await sql`SELECT c.name as category, COUNT(a.id) as total_ads, AVG(a.price) as avg_price, SUM(a.views_count) as total_views FROM categories c LEFT JOIN ads a ON a.category_id = c.id AND a.status = 'active' WHERE c.is_active = true GROUP BY c.id, c.name ORDER BY total_ads DESC`;
    return c.json({ categories });
  } catch (err) {
    console.error('Analytics categories error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch category analytics' });
  }
});

analyticsRoutes.get('/events', async (c) => {
  try {
    const sql = getSql(c.env);
    const { event, limit = '100', offset = '0' } = c.req.query();
    let whereClause = '';
    if (event) whereClause = `WHERE event_name = '${event}'`;
    const limitNum = Math.min(parseInt(limit) || 100, 500);
    const offsetNum = parseInt(offset) || 0;
    const events = await sql`SELECT * FROM analytics_events ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    return c.json({ events });
  } catch (err) {
    console.error('Analytics events error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch events' });
  }
});

analyticsRoutes.get('/performance', async (c) => {
  try {
    const sql = getSql(c.env);
    const { metric, limit = '100' } = c.req.query();
    let whereClause = '';
    if (metric) whereClause = `WHERE metric_name = '${metric}'`;
    const limitNum = Math.min(parseInt(limit) || 100, 500);
    const metrics = await sql`SELECT metric_name, AVG(value) as avg_value, COUNT(*) as samples, COUNT(*) FILTER (WHERE rating = 'good') as good_count, COUNT(*) FILTER (WHERE rating = 'needs-improvement') as needs_improvement_count, COUNT(*) FILTER (WHERE rating = 'poor') as poor_count FROM performance_metrics ${sql(whereClause)} GROUP BY metric_name ORDER BY avg_value DESC LIMIT ${limitNum}`;
    return c.json({ metrics });
  } catch (err) {
    console.error('Analytics performance error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch performance metrics' });
  }
});

export default analyticsRoutes;