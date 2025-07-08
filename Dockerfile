# Use Node.js 18 as the base image
FROM node:18-alpine

# Add curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build tools like Vite and tsx)
RUN npm ci

# Create user and group BEFORE copying application files
RUN addgroup -g 1001 nodejs && adduser -S thangapp -u 1001 -G nodejs -h /app -D

# Copy the rest of the application with proper ownership
COPY --chown=thangapp:nodejs . .

# Build the application (still as root for now, then fix ownership)
RUN npm run build

# Ensure all files have correct ownership
RUN chown -R thangapp:nodejs /app

# Switch to the non-root user
USER thangapp

# Expose the port
EXPOSE 3003

# Use tsx to run TypeScript files directly
CMD ["npx", "tsx", "server/frontendServer.ts"]
