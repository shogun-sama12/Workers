# Stage 1: Build Stage
# Use Node.js official image as the base image
FROM node:18-alpine AS builder

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire source code to the container
COPY . .

# Build the React application for production
RUN npm run build

# Stage 2: Production Stage
# Use Nginx lightweight web server to serve the built application
FROM nginx:alpine

# Copy the built application from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration (optional, for better SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (HTTP)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
