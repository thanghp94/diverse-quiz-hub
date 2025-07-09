# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "BUILD_CACHE_BUSTER_$(date +%s)" # Keep this line
RUN npm run build

# !!! CORRECTED DEBUGGING LINES !!!
# This line will now correctly find index.html
RUN echo "--- Content of /app/client/dist/public/index.html (after npm run build) ---"
RUN cat /app/client/dist/public/index.html 
RUN echo "-------------------------------------------------------------------"
# This will now correctly list contents
RUN echo "--- Listing contents of /app/client/dist/public (after npm run build) ---"
RUN ls -lhR /app/client/dist/public
# This will now correctly cat the CSS file
RUN echo "--- Content of /app/client/dist/public/assets/index-D_KFIesz.css ---"
RUN cat /app/client/dist/public/assets/index-D_KFIesz.css
RUN echo "--------------------------------------------------------"
# !!! END DEBUGGING LINES !!!


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage
# !!! THIS IS THE MOST CRITICAL CHANGE !!!
# Copy the built files from the correct build_stage path to Nginx's public directory
COPY --from=build_stage /app/client/dist/public /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]