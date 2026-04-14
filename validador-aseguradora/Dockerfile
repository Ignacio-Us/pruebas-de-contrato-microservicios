FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ src/
COPY tests/ tests/
EXPOSE 3003
CMD ["npm", "run", "dev"]