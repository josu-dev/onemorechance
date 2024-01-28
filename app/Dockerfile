FROM node:current-alpine3.18

WORKDIR /app
COPY package*.json .
RUN npm i --ignore-scripts
COPY . .
RUN npm run build

ARG PORT 5173
ENV PORT ${PORT}
ENV NODE_ENV production

EXPOSE ${PORT}

## I know this is not the best, but no time left
CMD [ "npm", "run", "dev:start" ]
