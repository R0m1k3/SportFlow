# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built application from the build stage to Nginx's default HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (interne au conteneur)
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]