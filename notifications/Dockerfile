FROM node:24-alpine3.21

WORKDIR /app

# Way faster builds
COPY --chown=node:node . .

USER node

CMD ["npm", "run", "dev"]