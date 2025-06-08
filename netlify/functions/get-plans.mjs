import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    // جلب الخطط من قاعدة البيانات
    const plans = await sql`
      SELECT p.*, 
             COUNT(DISTINCT s.user_id) as subscribers_count
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    return res.status(200).json({ plans });
  } catch (error) {
    console.error('خطأ في get-plans:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
} 