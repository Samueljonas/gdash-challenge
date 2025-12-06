# Step 1: Build React
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (including dev dependencies for the build)
RUN npm install
COPY . .
# Generate the 'dist' folder
RUN npm run build

# Step 2: Nginx Server
FROM nginx:alpine
# Copy the React build to the Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom configuration (we will create it below)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]