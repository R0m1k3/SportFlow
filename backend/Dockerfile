FROM node:20-alpine

WORKDIR /app/backend

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Copy and make build script executable
COPY scripts/build.sh ./scripts/
RUN chmod +x ./scripts/build.sh

# Build the application
RUN ./scripts/build.sh

# Clean up dev dependencies
RUN npm prune --production

EXPOSE 3001
CMD ["node", "--no-warnings=ExperimentalWarning", "dist/index.js"]