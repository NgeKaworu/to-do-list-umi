FROM node:lts-alpine as builder

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:stable-alpine

EXPOSE 80

COPY --from=builder /home/node/app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
