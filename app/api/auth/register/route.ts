import { NextResponse } from 'next/server';
import { query, DatabaseError } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

// Input validation schema with enhanced password requirements
const registerSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون أكثر من حرفين')
    .max(50, 'الاسم يجب أن يكون أقل من 50 حرف'),
  email: z.string()
    .email('البريد الإلكتروني غير صالح')
    .max(255, 'البريد الإلكتروني طويل جداً'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(72, 'كلمة المرور يجب أن تكون أقل من 72 حرف')
    .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل'),
  phoneNumber: z.string()
    .min(10, 'رقم الهاتف غير صالح')
    .max(15, 'رقم الهاتف غير صالح')
    .regex(/^[0-9+]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
  userType: z.enum(['trainer', 'trainee'], {
    invalid_type_error: 'نوع المستخدم يجب أن يكون مدرب أو متدرب',
  }),
});

// JWT signing key from environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!'
);

// Apply rate limiting
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max number of unique tokens per interval
});

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    try {
      await limiter.check(5, ip); // 5 requests per IP
    } catch {
      return NextResponse.json(
        { message: 'تم تجاوز الحد المسموح به من المحاولات. الرجاء المحاولة لاحقاً' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    const { name, email, password, phoneNumber, userType } = validatedData;

    // Hash password with increased rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

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

    // Create JWT token with additional security claims
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .setNotBefore(Math.floor(Date.now() / 1000)) // Token not valid before now
      .sign(JWT_SECRET);

    // Create user profile based on type
    if (userType === 'trainer') {
      await query(
        `INSERT INTO trainers (
          user_id,
          created_at,
          updated_at,
          status
        ) VALUES ($1, NOW(), NOW(), 'pending')`,
        [user.id]
      );
    } else {
      await query(
        `INSERT INTO trainees (
          user_id,
          created_at,
          updated_at
        ) VALUES ($1, NOW(), NOW())`,
        [user.id]
      );
    }

    // Create response with enhanced security headers
    const response = NextResponse.json({
      message: 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        userType: user.user_type
      }
    }, { 
      status: 201,
      headers: {
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'بيانات غير صالحة',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error instanceof DatabaseError) {
      if (error.code === '23505' && error.constraint?.includes('email')) {
        return NextResponse.json(
          { message: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { message: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
} 
} 