'use strict';

const express = require('express');
const licenseRoutes = require('./routes/license.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { setupPactStates } = require('./middlewares/pactState');


const createApp = () => {
  const app = express();

 
  app.use(express.json());

  // Permite recibir datos de formularios HTML (no se usa aquí pero es buena práctica)
  app.use(express.urlencoded({ extended: false }));


  // Endpoint simple para verificar que el servicio está corriendo.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'licencias' });
  });

  // Endpoint interno para verificación de contratos (Pact).
  // Solo se expone en entorno de test para preparar estados de BD.
  if (process.env.NODE_ENV === 'test') {
    setupPactStates(app);
  }

  app.use('/licenses', licenseRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'ROUTE_NOT_FOUND' });
  });

  app.use(errorHandler);

  return app;
};

module.exports = { createApp };