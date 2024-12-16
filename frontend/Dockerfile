# Base Image
FROM oven/bun

# Set working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install dependencies
RUN bun install --ignore-scripts

# Run app
CMD ["bun", "dev"]

# Expose ports
EXPOSE 3000