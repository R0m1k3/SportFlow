# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies
# Using npm install to be more resilient to package-lock.json issues
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
ENV PORT 3000 # Next.js default port

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]