# ----------- Stage 1: Build ----------
FROM node:18 AS builder

WORKDIR /app

# Copy everything and install deps
COPY . .
RUN npm install
RUN npm run build

# ----------- Stage 2: Serve ----------
FROM nginx:alpine

# Copy build output from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Expose port 80 (default)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
