# Use a version of Node.js that is compatible with canvas 2.9.0.
# It's often best to use an LTS version of Node.js for better stability.
FROM node:14

# Create a directory to hold the application code inside the image.
WORKDIR /usr/src/app

# Install system dependencies required by canvas.
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libfontconfig1-dev

# Copy package.json and package-lock.json.
# Using a wildcard ensures both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install canvas 2.9.0 explicitly.
RUN npm install

# Bundle app source.
COPY . .

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon.
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime.
CMD [ "node", "app.js" ]
