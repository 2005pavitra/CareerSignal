FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose API port
EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "server.js"]
