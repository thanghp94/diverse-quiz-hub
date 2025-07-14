# Stage 1: Build the Vite application
FROM node:20-alpine AS build_stage

WORKDIR /app

# !!! AGGRESSIVE CLEANUP !!!
RUN rm -rf node_modules dist .npm/ .cache/ 
# !!! END AGGRESSIVE CLEANUP !!!

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "BUILD_CACHE_BUSTER_$(date +%s)"

RUN npm run build

# !!! ADD THIS CRITICAL PERMISSIONS FIX HERE !!!
RUN chmod -R a+rX /app/dist 
# !!! END CRITICAL PERMISSIONS FIX !!!

# !!! DEBUGGING LINES - ENSURE THEY ARE STILL HERE and correct paths !!!
RUN echo "--- Content of /app/dist/index.html (after npm run build) ---"
RUN cat /app/dist/index.html 
RUN echo "-------------------------------------------------------------------"
RUN echo "--- Listing contents of /app/dist (after npm run build) ---"
RUN ls -lhR /app/dist
RUN echo "--- Listing CSS files in assets directory ---"
RUN find /app/dist -name "*.css" -exec echo "Found CSS: {}" \; -exec head -5 {} \;
RUN echo "--------------------------------------------------------"
# !!! END DEBUGGING LINES !!!


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage
COPY --from=build_stage /app/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]
