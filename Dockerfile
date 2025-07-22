# Étape de construction
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-package-lock && npm install
COPY . .
RUN npm run build

# Étape d'exécution
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "run", "preview"]