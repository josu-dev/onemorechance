FROM node:current-alpine3.18 AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:current-alpine3.18 AS runner
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

ENV PORT 3000
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD [ "node", "build" ]
