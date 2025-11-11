# NEMCATACOA_3
Nemcatacoa es un protecto de desarrollo el cual su objetivo es ayudar al usuario en su busqueda por un viaje mas placentero en los lugares mas turisticpos de Colombia. 

## Probar la conexión a la base de datos

1. Configura tus variables en `BackEnd/nemcatacoa-api/.env` (host, puerto, usuario, password y base).
2. Ejecuta el script de ejemplo:
   ```bash
   cd BackEnd/nemcatacoa-api
   node src/examples/queryExample.js
   ```
3. Si la conexión es correcta verás en consola `[{ ok: 1 }]`, que es la respuesta del `SELECT 1 AS ok` ejecutado mediante el helper `query`.
