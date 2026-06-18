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

# Compilar TS a JS
RUN npm run build

# Iniciar el servicio compilado
CMD ["npm", "run", "start"]
