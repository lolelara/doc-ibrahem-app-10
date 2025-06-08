import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    // التحقق من صلاحيات المشرف
    const adminCheck = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `;

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return res.status(403).json({ error: 'غير مصرح لك بالوصول' });
    }

    // جلب المستخدمين من قاعدة البيانات
    const users = await sql`
      SELECT id, email, name, role, created_at,
             (SELECT COUNT(*) FROM subscriptions WHERE user_id = users.id) as subscription_count
      FROM users
      ORDER BY created_at DESC
    `;

    return res.status(200).json({ users });
  } catch (error) {
    console.error('خطأ في get-users:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
}
