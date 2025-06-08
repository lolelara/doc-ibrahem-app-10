import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';

// Input validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  phoneNumber: z.string().min(10, 'رقم الهاتف غير صالح'),
  userType: z.enum(['trainer', 'trainee'], {
    invalid_type_error: 'نوع المستخدم يجب أن يكون مدرب أو متدرب',
  }),
});

// JWT signing key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    const { name, email, password, phoneNumber, userType } = validatedData;

    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database using a transaction
    const result = await query(
      `INSERT INTO users (
        name,
        email,
        password_hash,
        phone_number,
        user_type,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, phone_number, user_type`,
      [name, email, hashedPassword, phoneNumber, userType]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      userType: user.user_type
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // If user is a trainer, create trainer profile
    if (userType === 'trainer') {
      await query(
        `INSERT INTO trainers (user_id, created_at, updated_at)
        VALUES ($1, NOW(), NOW())`,
        [user.id]
      );
    }
    // If user is a trainee, create trainee profile
    else {
      await query(
        `INSERT INTO trainees (user_id, created_at, updated_at)
        VALUES ($1, NOW(), NOW())`,
        [user.id]
      );
    }

    // Set cookie with JWT token
    const response = NextResponse.json({
      message: 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        userType: user.user_type
      }
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'بيانات غير صالحة', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
} 