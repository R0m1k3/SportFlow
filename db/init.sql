-- Activer l'extension pour générer des UUIDs si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer la table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table des séances de sport
CREATE TABLE sport_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bike', 'weight_training', 'walking')),
    duration INTEGER NOT NULL, -- en minutes
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer un utilisateur administrateur par défaut
-- Le mot de passe est 'admin'. Il est haché avec bcrypt (coût de 10).
-- $2a$10$CwTycUXWue0Thq9StjUM0u.LwKgoKVjL/Zp/CoKvGvUT2dOKjYxU2 est le hash pour "admin"
INSERT INTO users (email, password_hash, role) VALUES ('admin', '$2a$10$CwTycUXWue0Thq9StjUM0u.LwKgoKVjL/Zp/CoKvGvUT2dOKjYxU2', 'admin');