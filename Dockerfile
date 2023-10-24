# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build


# production stage
FROM nginx:stable-alpine as production-stage

LABEL org.opencontainers.image.source=https://github.com/Mosquito-Alert/map

HEALTHCHECK --interval=30s --retries=3 --timeout=5s CMD curl --fail http://localhost || exit 1

WORKDIR /app
COPY --from=build-stage /app/dist/spa /app
COPY nginx.conf /etc/nginx/nginx.conf
