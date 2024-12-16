# Base Image
FROM oven/bun

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json bun.lockb ./

COPY prisma .

# Install dependencies
RUN bun install --ignore-scripts

# Copy the rest of the application
COPY . .

# Generate Prisma client for the correct platform
RUN bunx prisma generate

# Run app
CMD ["bun", "dev"]

# Expose ports
EXPOSE 7000