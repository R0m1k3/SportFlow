CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE session_type AS ENUM ('bike', 'weight_training', 'walking');

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type session_type NOT NULL,
    duration INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert a default admin user with password 'admin'
-- The password 'admin' is hashed using bcrypt
INSERT INTO users (id, email, password_hash, role) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', '$2a$10$Y.u9sED0/lX5y2nhzI9Vb.9aRTwS2bT9eYxS9VzL.X.Kj2G.Yg/jG', 'admin');