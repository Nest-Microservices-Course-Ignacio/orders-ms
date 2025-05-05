## Build de Producción

Construir imagen de docker con el tag `:prod` y utilizando el `Dockerfile.prod`
ejemplo:
```
docker build -f Dockerfile.prod -t orders-ms:prod .
```