# --- STAGE 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev tools)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile the NestJS application
RUN npm run build

# --- STAGE 2: Production Runtime ---
FROM node:20-alpine AS production

# Set environment to production
ENV NODE_ENV=production

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Ensure the container runs as a non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]