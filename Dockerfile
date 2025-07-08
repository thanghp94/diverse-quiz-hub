# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build tools like Vite and tsx)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the Node.js backend app runs on
EXPOSE 3003

# --- CRITICAL FIX: User creation ---
# Using --disabled-password and --gecos "" to ensure no password prompt and no GECOS info
# Using -G to add to secondary group, -D to disable home dir creation, -h to specify home (if needed)
# For Alpine, adduser -S (system user) is correct, but let's ensure group is primary or well-defined.
# Let's ensure the group is created first and then add the user to it.
RUN addgroup -g 1001 nodejs && adduser -S thangapp -u 1001 -G nodejs -h /app -D
# Explained:
# addgroup -g 1001 nodejs : Creates group 'nodejs' with GID 1001
# adduser -S thangapp    : Creates system user 'thangapp'
# -u 1001                : With UID 1001
# -G nodejs              : And primary group 'nodejs'
# -h /app                : Sets home directory to /app (optional, but good practice if app relies on home)
# -D                     : No password

# Change ownership of the app directory to the non-root user
RUN chown -R thangapp:nodejs /app

# Switch to the non-root user
USER thangapp

# Use tsx to run TypeScript files directly
CMD ["npx", "tsx", "server/frontendServer.ts"]