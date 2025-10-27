# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

WORKDIR /app

# 👇 These lines are missing in your current file — they’re crucial
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .

# 👇 Build the frontend with the env baked in
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
