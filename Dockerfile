FROM ubuntu:22.04

RUN apt-get update && apt-get install -y ffmpeg

RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

RUN npm install -g yarn

EXPOSE 3000
EXPOSE 8000

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["node", "index.js"]
