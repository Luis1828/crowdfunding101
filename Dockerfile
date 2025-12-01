FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY src/package.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src/ ./

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "index.js"]
