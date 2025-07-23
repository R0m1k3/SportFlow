FROM node:20-alpine

WORKDIR /app/backend

# First copy only package files for better caching
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the files
COPY . .

# Build the application
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]