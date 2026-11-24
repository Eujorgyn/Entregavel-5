# FitGo em container — alternativa à instalação direta na EC2
FROM node:22-alpine
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
ENV PORT=80
EXPOSE 80
# o banco SQLite fica em /app/backend/data (monte um volume para não perder os dados)
VOLUME ["/app/backend/data"]
CMD ["node", "backend/server.js"]
