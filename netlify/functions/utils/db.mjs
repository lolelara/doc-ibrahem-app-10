import { neon } from '@neondatabase/serverless';

// استخدام متغيرات البيئة من Netlify
const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('NEON_DATABASE_URL environment variable is not set');
}

// إنشاء اتصال بقاعدة البيانات مع إعدادات محسنة
const sql = neon(connectionString, {
  fetchOptions: {
    cache: 'no-store',
  },
  connectionTimeoutMillis: 5000,
  maxConnections: 10,
});

// اختبار الاتصال
sql`SELECT 1`
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error:', err));

export default sql;
