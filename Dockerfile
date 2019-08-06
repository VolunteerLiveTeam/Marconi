FROM node

RUN echo HA HA GET HACKED

RUN mkdir -p /srv/
WORKDIR /srv/

COPY package.json /srv/
RUN npm install

COPY . /srv/
RUN npm run build

ENV NODE_ENV=production
CMD [ "npm", "start" ]
