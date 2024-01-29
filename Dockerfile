# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle your app's source inside the Docker image
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 80

# Define the command to run your app
CMD ["npm", "start"]