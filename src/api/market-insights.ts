import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../db/hyperdrive';
import { requireAdmin } from '../middleware/security';
import type { AppContext } from '../middleware/types';

export const marketInsightsRoutes = new Hono<AppContext>();

marketInsightsRoutes.use('*', requireAdmin);

marketInsightsRoutes.get('/stats', async (c) => {
	try {
		const sql = getSql(c.env);
		const [
			totalUsers,
			activeUsers,
			newUsersThisMonth,
			totalAds,
			activeAds,
			soldAds,
			totalRevenue,
			avgListingPrice,
			topCategories,
			userGrowth,
			listingGrowth,
			revenueGrowth
		] = await Promise.all([
			sql`SELECT COUNT(*) as count FROM profiles`,
			sql`SELECT COUNT(*) as count FROM profiles WHERE status = 'active'`,
			sql`SELECT COUNT(*) as count FROM profiles WHERE created_at > NOW() - INTERVAL '30 days'`,
			sql`SELECT COUNT(*) as count FROM ads`,
			sql`SELECT COUNT(*) as count FROM ads WHERE status = 'active'`,
			sql`SELECT COUNT(*) as count FROM ads WHERE status = 'sold'`,
			sql`SELECT SUM(amount) as total FROM promotion_payments WHERE status = 'approved'`,
			sql`SELECT AVG(price) as avg FROM ads WHERE status = 'active'`,
			sql`SELECT c.name as category, COUNT(a.id) as count, AVG(a.price) as avg_price FROM categories c LEFT JOIN ads a ON a.category_id = c.id AND a.status = 'active' WHERE c.is_active = true GROUP BY c.id, c.name ORDER BY count DESC LIMIT 10`,
			sql`SELECT DATE(created_at) as date, COUNT(*) as count FROM profiles WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date`,
			sql`SELECT DATE(created_at) as date, COUNT(*) as count FROM ads WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date`,
			sql`SELECT DATE(created_at) as date, SUM(amount) as total FROM promotion_payments WHERE status = 'approved' AND created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date`,
		]);

		return c.json({
			users: {
				total: parseInt(totalUsers[0]?.count || '0'),
				active: parseInt(activeUsers[0]?.count || '0'),
				newThisMonth: parseInt(newUsersThisMonth[0]?.count || '0'),
			},
			ads: {
				total: parseInt(totalAds[0]?.count || '0'),
				active: parseInt(activeAds[0]?.count || '0'),
				sold: parseInt(soldAds[0]?.count || '0'),
			},
			revenue: {
				total: parseFloat(totalRevenue[0]?.total || '0'),
			},
			listing: {
				avgPrice: parseFloat(avgListingPrice[0]?.avg || '0'),
			},
			topCategories: topCategories.map(row => ({
				category: row.category,
				count: parseInt(row.count),
				avgPrice: parseFloat(row.avg_price),
			})),
			growth: {
				users: userGrowth.map(g => ({ date: g.date, count: parseInt(g.count) })),
				listings: listingGrowth.map(g => ({ date: g.date, count: parseInt(g.count) })),
				revenue: revenueGrowth.map(g => ({ date: g.date, total: parseFloat(g.total) })),
			},
		});
	} catch (error) {
		console.error('Market insights error:', error);
		throw new HTTPException(500, { message: 'Failed to fetch market insights' });
	}
});