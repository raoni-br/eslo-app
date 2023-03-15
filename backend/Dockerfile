FROM node:16-slim

RUN apt-get update
RUN apt-get install -y openssl

RUN mkdir -p /opt/eslo/backend

COPY ./app/ /opt/eslo/backend/app

COPY ./package.json /opt/eslo/backend/package.json
COPY ./tsconfig.json /opt/eslo/backend/tsconfig.json
COPY ./jest.config.js /opt/eslo/backend/jest.config.js
COPY ./.env /opt/eslo/backend/.env

WORKDIR /opt/eslo/backend

RUN npm install

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
