FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# CAMBIA ESTA LÍNEA:
RUN npm install --only=production

# Copy source code
COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/app.js"]