FROM node:18

EXPOSE 3000

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY . .

RUN npm run tsc

CMD ["npm", "run", "app"]
