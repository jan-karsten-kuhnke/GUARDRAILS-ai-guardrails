# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:18-alpine

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

# Install a production server (e.g., serve) globally
RUN yarn global add serve

# Expose port 3000 (or the port your production server uses)
EXPOSE 3000

# build and start the production server
# Start the app
CMD ["yarn", "serve"]

