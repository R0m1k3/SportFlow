# Stage 1: Builder - Use the full node:20 image which includes build tools
FROM node:20 AS builder
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies. Using the full node image provides necessary build tools
# for any native modules that might be part of the dependency tree.
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Runner - Use a lightweight alpine image for the final stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
ENV PORT 3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
# The standalone output includes only the necessary files to run the app,
# including a minimal set of node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]