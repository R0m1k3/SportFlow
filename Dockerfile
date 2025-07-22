# Étape 1: Build
# Installe toutes les dépendances (dev inclus) et construit l'application.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2: Production
# Utilise une image Node.js propre pour la production.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copier toute l'application buildée depuis l'étape précédente.
# Cela inclut le code, les node_modules, et le package.json.
COPY --from=builder /app ./

# Supprimer les dépendances de développement pour alléger l'image finale.
RUN npm prune --production

EXPOSE 3000

# Démarrer le serveur de production.
CMD ["npm", "run", "start"]