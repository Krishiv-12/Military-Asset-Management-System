FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
EXPOSE 4000
CMD npx prisma migrate deploy && node prisma/seed.js && node src/server.js
