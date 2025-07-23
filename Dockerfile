FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances et les installer
COPY package.json ./
RUN npm install

# Copier le reste du code de l'application
COPY . .

# Construire l'application pour la production
RUN npm run build

# Exposer le port sur lequel Vite va tourner
EXPOSE 8080

# Démarrer le serveur de prévisualisation
CMD ["npm", "run", "preview"]