FROM node:21

WORKDIR /app

COPY package*.json ./
RUN npm uninstall tsc
RUN npm install -D typescript

COPY prisma ./prisma/

COPY . .

RUN npx tsc
RUN npx prisma generate
# RUN npx prisma migrate dev --name init

EXPOSE 8080
# CMD ["npm", "run", "start"]
