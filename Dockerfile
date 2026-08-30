# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# VITE_API_BASE_URL을 주지 않는다.
# 비워두면 client.ts가 같은 오리진의 /api로 호출하고, Caddy가 app으로 넘긴다.
# (여기서 절대 URL을 넣으면 CORS와 Secure 쿠키 문제가 다시 생긴다)
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
