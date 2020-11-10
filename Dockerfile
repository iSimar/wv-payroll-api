FROM node:14
WORKDIR /usr/src/app
COPY package*.json index.js ./
RUN mkdir uploads
RUN mkdir db
RUN touch db/db.sqlite
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]