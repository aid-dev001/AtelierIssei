FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist
COPY server/public ./server/public

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/index.js"]