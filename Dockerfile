FROM node:22.15.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g npm@latest && npm ci --only=production
COPY . . 
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]