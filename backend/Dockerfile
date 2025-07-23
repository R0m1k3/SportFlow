FROM node:20-alpine

WORKDIR /app/backend

# Copy package.json to leverage Docker cache
COPY package.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove devDependencies after build to keep the image small
RUN npm prune --production

EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]