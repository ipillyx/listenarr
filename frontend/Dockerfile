# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

WORKDIR /app

# 👇 Pass through the build arg and bake it into Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .

# 👇 This build step bakes the VITE_API_URL into the static bundle
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
