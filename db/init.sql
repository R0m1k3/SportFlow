-- Créer l'extension pgcrypto si elle n'existe pas, pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer un utilisateur admin par défaut
-- Le mot de passe est 'admin'
-- Le hash a été généré avec bcrypt
INSERT INTO users (email, password_hash, role)
VALUES ('admin', '$2a$10$TWHc/A.t3eswI.1v5hnpIuU2y0YJc.O2vJ.mK.5nL.6oP.7qR.8sS', 'admin')
ON CONFLICT (email) DO NOTHING;