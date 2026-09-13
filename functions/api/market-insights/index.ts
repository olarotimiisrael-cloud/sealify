import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAdmin } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

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
        avgListingPrice: parseFloat(avgListingPrice[0]?.avg || '0'),
      },
      topCategories: topCategories.map((c: any) => ({
        category: c.category,
        count: parseInt(c.count || '0'),
        avgPrice: parseFloat(c.avg_price || '0'),
      })),
      growth: {
        users: userGrowth.map((u: any) => ({ date: u.date, count: parseInt(u.count || '0') })),
        listings: listingGrowth.map((l: any) => ({ date: l.date, count: parseInt(l.count || '0') })),
        revenue: revenueGrowth.map((r: any) => ({ date: r.date, total: parseFloat(r.total || '0') })),
      },
    });
  } catch (err) {
    console.error('Market insights stats error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch market insights stats' });
  }
});

marketInsightsRoutes.get('/price-index', async (c) => {
  try {
    const sql = getSql(c.env);
    const { category } = c.req.query();

    let whereClause = 'WHERE a.status = \'active\'';
    const params: any[] = [];
    if (category) {
      whereClause += ` AND a.category_id = $1`;
      params.push(category);
    }

    const priceIndex = await sql`
      SELECT 
        c.name as category,
        COUNT(a.id) as listing_count,
        MIN(a.price) as min_price,
        MAX(a.price) as max_price,
        AVG(a.price) as avg_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.price) as median_price
      FROM ads a
      LEFT JOIN categories c ON a.category_id = c.id
      ${sql(whereClause)}
      GROUP BY c.id, c.name
      ORDER BY listing_count DESC
    `;

    const overallStats = await sql`
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price
      FROM ads
      WHERE status = 'active'
    `;

    return c.json({
      priceIndex: priceIndex.map((p: any) => ({
        category: p.category,
        listingCount: parseInt(p.listing_count || '0'),
        minPrice: parseFloat(p.min_price || '0'),
        maxPrice: parseFloat(p.max_price || '0'),
        avgPrice: parseFloat(p.avg_price || '0'),
        medianPrice: parseFloat(p.median_price || '0'),
      })),
      overall: {
        minPrice: parseFloat(overallStats[0]?.min_price || '0'),
        maxPrice: parseFloat(overallStats[0]?.max_price || '0'),
        avgPrice: parseFloat(overallStats[0]?.avg_price || '0'),
        medianPrice: parseFloat(overallStats[0]?.median_price || '0'),
      },
    });
  } catch (err) {
    console.error('Market insights price index error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch price index' });
  }
});

export default marketInsightsRoutes;