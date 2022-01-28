FROM node:8-alpine

WORKDIR /usr/app

COPY package.json .
RUN npm install

# RUN ls -l 
# RUN ls -l node_modules/

COPY . . 

EXPOSE 1337