-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('trainer', 'trainee')),
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on email and firebase_uid for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);

-- Create trainers table for additional trainer information
CREATE TABLE IF NOT EXISTS trainers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    specialization VARCHAR(100),
    experience_years INTEGER,
    certification_urls TEXT[],
    hourly_rate DECIMAL(10,2),
    available_times JSONB,
    rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trainees table for additional trainee information
CREATE TABLE IF NOT EXISTS trainees (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    fitness_level VARCHAR(20),
    health_conditions TEXT[],
    goals TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create training_plans table
CREATE TABLE IF NOT EXISTS training_plans (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER,
    price DECIMAL(10,2),
    difficulty_level VARCHAR(20),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    trainee_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES training_plans(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    payment_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES training_plans(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES workouts(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sets INTEGER,
    reps INTEGER,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id SERIAL PRIMARY KEY,
    trainee_id INTEGER REFERENCES users(id),
    workout_id INTEGER REFERENCES workouts(id),
    completion_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    difficulty_rating INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 