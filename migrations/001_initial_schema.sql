-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trainer profiles
CREATE TABLE IF NOT EXISTS trainer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    experience_years INTEGER,
    bio TEXT,
    certification_details TEXT,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trainee profiles
CREATE TABLE IF NOT EXISTS trainee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    fitness_goal TEXT,
    health_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training programs
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER,
    difficulty_level VARCHAR(20),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program enrollments
CREATE TABLE IF NOT EXISTS program_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sets INTEGER,
    reps INTEGER,
    rest_seconds INTEGER,
    video_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    date DATE,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Measurements
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    date DATE,
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    biceps DECIMAL(5,2),
    thighs DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition plans
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    daily_calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fats_grams INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meals
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutrition_plan_id UUID REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fats_grams INTEGER,
    meal_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_profiles_updated_at
    BEFORE UPDATE ON trainer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainee_profiles_updated_at
    BEFORE UPDATE ON trainee_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at
    BEFORE UPDATE ON training_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_enrollments_updated_at
    BEFORE UPDATE ON program_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at
    BEFORE UPDATE ON progress_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_measurements_updated_at
    BEFORE UPDATE ON measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
    BEFORE UPDATE ON nutrition_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_user_id ON trainer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_trainee_profiles_user_id ON trainee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_trainer_id ON training_programs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_trainee_id ON program_enrollments(trainee_id);
CREATE INDEX IF NOT EXISTS idx_workouts_program_id ON workouts(program_id);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_trainee_id ON progress_tracking(trainee_id);
CREATE INDEX IF NOT EXISTS idx_measurements_trainee_id ON measurements(trainee_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_trainer_id ON nutrition_plans(trainer_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_trainee_id ON nutrition_plans(trainee_id);
CREATE INDEX IF NOT EXISTS idx_meals_nutrition_plan_id ON meals(nutrition_plan_id);
CREATE INDEX IF NOT EXISTS idx_reviews_program_id ON reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_reviews_trainee_id ON reviews(trainee_id); 