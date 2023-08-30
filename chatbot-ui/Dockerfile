# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json ./

# Install app dependencies
RUN yarn install  --network-timeout 1000000

# Copy the rest of the application code to the container
COPY . .

# Build the app
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"]