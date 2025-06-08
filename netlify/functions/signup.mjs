import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'طريقة غير مسموح بها' });
  }

  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور والاسم مطلوبة' });
    }

    // التحقق من وجود المستخدم
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم في قاعدة البيانات
    const newUser = await sql`
      INSERT INTO users (email, password, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, 'user')
      RETURNING id, email, name, role, created_at
    `;

    return res.status(201).json({ user: newUser[0] });
  } catch (error) {
    console.error('خطأ في signup:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
} 