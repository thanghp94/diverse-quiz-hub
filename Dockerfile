# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# !!! ADD THIS LINE FOR DEBUGGING !!!
RUN echo "--- Content of /app/dist/public/index.html (after npm run build) ---"
RUN cat /app/dist/public/index.html
RUN echo "-------------------------------------------------------------------"
# !!! END DEBUGGING LINE !!!


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage
COPY --from=build_stage /app/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]