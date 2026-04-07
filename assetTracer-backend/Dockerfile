# Gunakan image Node.js
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm install

# Copy semua file backend
COPY . .

# Expose port
EXPOSE 4000

# Jalankan aplikasi
CMD ["npm", "start"]