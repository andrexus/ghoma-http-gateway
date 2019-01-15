FROM node:10-alpine

ADD main.js config.js package.json package-lock.json /srv/

WORKDIR /srv

RUN npm ci

EXPOSE 3000 4196

CMD ["npm", "start"]
