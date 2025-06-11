# Use official Nginx image to serve static files
FROM nginx:alpine

# Copy Vite's build output to Nginx's public directory
COPY dist/ /usr/share/nginx/html

# Optional: expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
