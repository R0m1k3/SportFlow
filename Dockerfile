# Étape 1: Construire l'application React
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances et les installer
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape 2: Servir l'application avec un serveur Node.js léger
FROM node:18-alpine

WORKDIR /app

# Copier uniquement les dépendances de production depuis l'étape de build
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

# Copier les fichiers construits depuis l'étape de build
COPY --from=build /app/dist ./dist

# Exposer le port sur lequel le serveur va tourner
EXPOSE 8080

# Démarrer le serveur 'serve' pour servir le dossier 'dist'
# L'option -s gère le routage pour les Single Page Applications
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]