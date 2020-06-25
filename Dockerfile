FROM node:10-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --no-cache git

# Install app dependencies
COPY . /usr/src/app
RUN npm install -g pm2 && npm install && cd server && npm i && npm run build && cd ..

# Set environment variables
ENV NODE_ENV production
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

RUN npm run build

EXPOSE 3000
CMD ["pm2-runtime", "process.yml"]
