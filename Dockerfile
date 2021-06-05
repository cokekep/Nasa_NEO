FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY nasa_neo ./nasa_neo/

EXPOSE 3000

CMD ["npm", "start"]

