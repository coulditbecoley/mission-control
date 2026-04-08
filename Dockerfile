FROM node:20-alpine

WORKDIR /app

# Install build dependencies that might be needed
RUN apk add --no-cache python3 make g++

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Remove dev dependencies to reduce size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
