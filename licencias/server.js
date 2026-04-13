'use strict';

require('dotenv').config();

const { createApp } = require('./src/app');

/**
 * Punto de entrada de la aplicación.
 * Responsabilidad ÚNICA: leer la configuración del entorno
 * y levantar el servidor HTTP en el puerto indicado.
*/

const PORT = process.env.PORT || 3000;
const app  = createApp();

app.listen(PORT, () => {
  console.log(`[licencias-service] Servidor corriendo en http://localhost:${PORT}`);
});