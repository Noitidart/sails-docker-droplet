FROM node:12-alpine

ARG WORKDIR=/opt/apps/the-sails-docker-droplet-app/

RUN mkdir -p $WORKDIR

WORKDIR $WORKDIR

COPY package.json package-lock.json $WORKDIR

RUN NODE_ENV=production npm i

COPY . $WORKDIR

RUN NODE_ENV=production npx webpack --config webpack.config.js

EXPOSE 1337

CMD npm start