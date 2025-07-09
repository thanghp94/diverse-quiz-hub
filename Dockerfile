# ...
# Stage 1: Build the Vite application
FROM node:18-alpine AS build_stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "BUILD_CACHE_BUSTER_$(date +%s)" # Keep this line
RUN npm run build

# !!! CORRECTED DEBUGGING LINES !!!
RUN echo "--- Content of /app/client/dist/public/index.html (after npm run build) ---"
RUN cat /app/client/dist/public/index.html # <-- CORRECTED PATH
RUN echo "-------------------------------------------------------------------"
RUN echo "--- Listing contents of /app/client/dist/public (after npm run build) ---"
RUN ls -lhR /app/client/dist/public # <-- CORRECTED PATH
RUN echo "--- Content of /app/client/dist/public/assets/index-D_KFIesz.css ---"
RUN cat /app/client/dist/public/assets/index-D_KFIesz.css # <-- CORRECTED PATH
RUN echo "--------------------------------------------------------"
# !!! END DEBUGGING LINES !!!


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS production_stage
# Also adjust this COPY if you are copying the processed index.html from /app/client/dist/public
# Your current COPY is: COPY --from=build_stage /app/dist/public /usr/share/nginx/html
# This might need to be: COPY --from=build_stage /app/client/dist/public /usr/share/nginx/html
# Let's verify the current COPY command's source path after you provide the build output.
COPY --from=build_stage /app/dist/public /usr/share/nginx/html # Keep this as is for now
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]