FROM node:current-alpine3.18

ARG PORT 5173
ARG TURSO_DB_AUTH_TOKEN
ARG TURSO_DB_URL

ENV TURSO_DB_AUTH_TOKEN ${TURSO_DB_AUTH_TOKEN}
ENV TURSO_DB_URL ${TURSO_DB_URL}

WORKDIR /app

COPY package*.json .
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

EXPOSE ${PORT}

ENV NODE_ENV production

USER node

CMD [ "npm", "run", "start" ]
