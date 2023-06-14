FROM node:16-alpine

WORKDIR /app

COPY dist/. /app

RUN npm i

ENTRYPOINT [ "node", "bin/basic-auth-file-server.js" ]