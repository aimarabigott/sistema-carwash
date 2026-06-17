FROM node:20-alpine

# Instalar dependencias del sistema necesarias para compilar módulos si es necesario
RUN apk add --no-cache git

WORKDIR /app

# Copiar archivos de paquetes
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3001

# Iniciar el servicio (como no estamos compilando a JS por tiempo, usamos ts-node)
CMD ["npm", "run", "start"]
