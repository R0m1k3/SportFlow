FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tout le reste du code source du projet
# Cela inclut le frontend et le backend
COPY . .

# Compiler le code TypeScript du backend en JavaScript
# Le résultat sera dans le dossier /backend/dist/
RUN npm run build:backend

# Exposer le port sur lequel le backend s'exécute
EXPOSE 3001

# La commande pour démarrer le serveur une fois le conteneur lancé
CMD ["node", "backend/dist/index.js"]