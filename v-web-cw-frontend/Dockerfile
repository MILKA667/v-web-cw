# Stage 1: Build
FROM node:20-bullseye AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies)
RUN npm install

# Копируем исходники
COPY . .

# Ставим права на tsc и vite, если нужно
RUN chmod +x ./node_modules/.bin/tsc ./node_modules/.bin/vite

# Собираем проект
RUN npx tsc -b && npx vite build

# Stage 2: Production
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
