FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo dev para Jest y Pact)
RUN npm install

COPY src/ src/
COPY tests/ tests/

EXPOSE 3002

CMD ["npm", "run", "dev"]