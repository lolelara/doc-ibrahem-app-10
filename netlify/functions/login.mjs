import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'طريقة غير مسموح بها' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const users = await sql`
      SELECT id, email, name, password, role
      FROM users
      WHERE email = ${email}
    `;

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const user = users[0];

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('خطأ في login:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
} 