FROM node:current-alpine3.18

WORKDIR /app

COPY package*.json .
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

EXPOSE ${PORT}

ENV NODE_ENV production

USER node

CMD [ "npm", "run", "start" ]
