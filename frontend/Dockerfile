FROM node:16-alpine

RUN apk add --no-cache git

RUN npm install -g @angular/cli@12

RUN mkdir -p /opt/eslo/frontend

COPY ./src /opt/eslo/frontend/src

COPY ./package.json /opt/eslo/frontend/package.json
COPY ./tsconfig.json /opt/eslo/frontend/tsconfig.json
COPY ./tsconfig.app.json /opt/eslo/backend/tsconfig.app.json

WORKDIR /opt/eslo/frontend

RUN npm install

ENV PORT 4200

EXPOSE 4200

CMD ["npm", "start"]
