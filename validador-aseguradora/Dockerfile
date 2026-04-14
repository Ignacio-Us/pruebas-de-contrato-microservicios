FROM node:25-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ src/
COPY tests/ tests/
EXPOSE 3003
CMD ["npm", "run", "dev"]