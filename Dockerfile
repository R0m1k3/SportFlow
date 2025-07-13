# Dockerfile pour la construction de production Next.js

# --- Étape 1: Builder ---
# Utilise une version spécifique de Node.js pour la reproductibilité et une image de base légère
FROM node:20-alpine AS builder

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie package.json et le fichier de verrouillage (lock file)
COPY package.json ./

# Installe toutes les dépendances (y compris les devDependencies pour la construction)
RUN npm install

# Copie le reste du code source de l'application
COPY . .

# Construit l'application Next.js pour la production
# La commande de construction utilisera les devDependencies installées
RUN npm run build

# --- Étape 2: Runner ---
# Utilise une image de base petite et sécurisée pour le conteneur final
FROM node:20-alpine

# Définit le répertoire de travail
WORKDIR /app

# Définit l'environnement sur "production"
# C'est crucial pour que Next.js s'exécute en mode production
ENV NODE_ENV production

# Copie package.json depuis l'étape de construction
COPY --from=builder /app/package.json ./

# Installe UNIQUEMENT les dépendances de production pour garder l'image légère
RUN npm install --omit=dev

# Copie l'application construite depuis l'étape de construction
COPY --from=builder /app/.next ./.next
# Copie le répertoire public pour les ressources statiques (s'il existe)
COPY --from=builder /app/public ./public

# Expose le port sur lequel l'application s'exécutera
EXPOSE 3000

# La commande pour démarrer l'application en mode production
CMD ["npm", "start"]