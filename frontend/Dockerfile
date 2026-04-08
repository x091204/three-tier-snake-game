FROM node:20-alpine AS build
RUN apk update && apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk update && apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx","-g","daemon off;"]
