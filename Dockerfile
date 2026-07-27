# --- Build the static SPA ---
FROM node:24-alpine AS build-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve the static build with nginx ---
FROM nginx:alpine
COPY --from=build-env /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
