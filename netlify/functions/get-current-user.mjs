import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    // جلب بيانات المستخدم من قاعدة البيانات
    const user = await sql`
      SELECT id, email, name, role, created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    return res.status(200).json({ user: user[0] });
  } catch (error) {
    console.error('خطأ في get-current-user:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
} 