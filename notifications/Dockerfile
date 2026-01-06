FROM node:24-alpine3.21

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

USER node

COPY --chown=node:node ./package*.json .

RUN npm ci

COPY --chown=node:node . .

CMD ["npm", "run", "dev"]