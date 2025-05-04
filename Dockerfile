FROM node:22.15.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g npm@latest && npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]