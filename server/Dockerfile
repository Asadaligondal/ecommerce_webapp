FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the server
CMD ["npm", "start"]