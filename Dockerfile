# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "BUILD_CACHE_BUSTER_$(date +%s)" # Keep this line
RUN npm run build

# !!! CORRECTED DEBUGGING LINES !!!
RUN echo "--- Content of /app/dist/public/index.html (after npm run build) ---"
RUN cat /app/dist/public/index.html
RUN echo "-------------------------------------------------------------------"
RUN echo "--- Listing contents of /app/dist/public (after npm run build) ---"
RUN ls -lhR /app/dist/public
RUN echo "--- Content of /app/dist/public/assets/index-D_KFIesz.css ---"
RUN cat /app/dist/public/assets/index-D_KFIesz.css
RUN echo "--------------------------------------------------------"
# !!! END DEBUGGING LINES !!!


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage
# !!! This crucial COPY now aligns with outDir: path.resolve(import.meta.dirname, "dist", "public") !!!
COPY --from=build_stage /app/dist/public /usr/share/nginx/html
# ... rest of Dockerfile ...
