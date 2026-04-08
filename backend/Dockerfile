FROM node:20-alpine
RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD [ "node","src/server.js" ]