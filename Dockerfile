# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build tools like Vite and tsx)
# This was the key fix for the 'npm run build' failure.
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (this produces static frontend assets, usually in a 'dist' or 'build' folder)
RUN npm run build

# Expose the port the Node.js backend app runs on


EXPOSE 3003 


# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S thangapp -u 1001 -G nodejs # Renamed user for clarity

# Change ownership of the app directory to the non-root user
# Ensure this user has read access to all files and write access where needed (e.g., logs, uploads)
RUN chown -R thangapp:nodejs /app
USER thangapp # Switch to the non-root user

# Use tsx to run TypeScript files directly (this starts your backend server)
CMD ["npx", "tsx", "server/frontendServer.ts"]