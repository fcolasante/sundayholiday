FROM node:8-alpine

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

# RUN ls -l 
# RUN ls -l node_modules/

COPY . . 

EXPOSE 3030