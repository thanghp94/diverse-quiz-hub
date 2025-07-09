# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
# This caches dependencies, so if they don't change, this layer is reused
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of your application code
# Ensure your client-side source code is here, as well as the 'public' folder
COPY . .

# Run the Vite build command
# This will create the production build in the specified output directory (e.g., /app/dist/public)
RUN npm run build


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage

# Copy the built files from the build_stage to Nginx's public directory
# Adjust '/app/dist/public' if your Vite config's outDir is different relative to /app
COPY --from=build_stage /app/dist/public /usr/share/nginx/html

# Copy a custom Nginx configuration (optional, but good practice)
# If you don't have this, you can omit it. Nginx has a default.
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx will serve on
EXPOSE 3003

# Command to start Nginx (default for nginx:alpine image)
CMD ["nginx", "-g", "daemon off;"]