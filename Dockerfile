FROM node:12.9.1 as build

WORKDIR /usr/src/heimdall

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

FROM node:12.9.1-alpine

WORKDIR /app

COPY --from=build /usr/src/heimdall/node_modules ./node_modules
COPY --from=build /usr/src/heimdall/dist .
COPY --from=build /usr/src/heimdall/src/public ./public

EXPOSE 5666

ENTRYPOINT [ "node", "index.js" ]
