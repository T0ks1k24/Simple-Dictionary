# =============================================================
# Frontend Dockerfile  (Node 20, multi-stage, nginx:alpine)
# =============================================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Build production bundle
ENV REACT_APP_API_URL=/api
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx/app.conf /etc/nginx/conf.d/app.conf

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
