FROM node:16.13.0-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --silent

COPY . .

CMD ["npm", "start"]

