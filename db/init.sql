-- Activer l'extension pour générer des UUID si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer un type ENUM pour les types de séances pour garantir la cohérence des données
CREATE TYPE session_type AS ENUM ('bike', 'weight_training', 'walking');

-- Créer la table des utilisateurs
-- Dans une application réelle, le mot de passe doit être stocké sous forme de hash sécurisé.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des séances de sport
CREATE TABLE sport_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type session_type NOT NULL,
    duration INTEGER NOT NULL, -- Durée en minutes
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX idx_sport_sessions_user_id ON sport_sessions(user_id);
CREATE INDEX idx_sport_sessions_date ON sport_sessions(date);

-- Message pour indiquer que le script a été exécuté
\echo 'Base de données et tables initialisées avec succès.'