FROM node:current-alpine3.18

WORKDIR /app
COPY package*.json .
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

ARG PORT 5173
ENV PORT ${PORT}
ENV NODE_ENV production

EXPOSE ${PORT}

CMD [ "npm", "run", "start" ]
