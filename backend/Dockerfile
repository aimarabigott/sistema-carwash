FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del bot
COPY . .

# Exponer el puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "src/index.js"]
