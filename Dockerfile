# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app

# !!! ADD THESE LINES FOR AGGRESSIVE CLEANUP !!!
RUN rm -rf node_modules dist .npm/ .cache/ 
# !!! END AGGRESSIVE CLEANUP !!!

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "BUILD_CACHE_BUSTER_$(date +%s)" # Keep this line
RUN npm run build

# !!! CORRECTED DEBUGGING LINES (Back to /app/dist/public) !!!
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
# !!! THIS CRITICAL COPY MUST BE /app/dist/public !!!
COPY --from=build_stage /app/dist/public /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]