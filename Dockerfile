FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Copy public folder
COPY public ./public

# Remove dev dependencies to keep image small
RUN npm prune --production

# Expose port
EXPOSE 3000

# Run as non-root user (security best practice)
USER root

# Start the server
CMD ["node", "dist/server.js"]