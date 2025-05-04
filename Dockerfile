FROM node:22.15.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g npm@latest && npm i
COPY . . 
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]