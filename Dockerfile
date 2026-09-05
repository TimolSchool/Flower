FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY frontend ./frontend
COPY tkt.jpg ./frontend/tkt.jpg
COPY backend ./backend
ENV PORT=8080
EXPOSE 8080
CMD ["node", "backend/server.js"]
