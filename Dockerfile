FROM node:bookworm-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npx playwright install --with-deps firefox

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js" ]
