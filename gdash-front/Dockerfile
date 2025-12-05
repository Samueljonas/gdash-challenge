# Etapa 1: Build do React
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Instala dependências (incluindo as de dev para o build)
RUN npm install
COPY . .
# Gera a pasta 'dist'
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:alpine
# Copia o build do React para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia configuração customizada (criaremos abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]