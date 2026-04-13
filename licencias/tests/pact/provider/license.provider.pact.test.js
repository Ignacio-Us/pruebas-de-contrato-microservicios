'use strict';

require('dotenv').config();

const { Verifier } = require('@pact-foundation/pact');
const path         = require('path');
const http         = require('http');
const { createApp } = require('../../../src/app');

describe('LicensesService — Provider Pact Verification', () => {
  let server;
  let port;

  beforeAll((done) => {
    process.env.NODE_ENV = 'test';
    const app = createApp();
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      console.log(`[Provider Test] App corriendo en puerto ${port}`);
      done();
    });
  });

  afterAll((done) => server.close(done));

  it('cumple el contrato definido por LicenseConsumer', async () => {
    await new Verifier({
      provider:        'LicensesService',
      providerBaseUrl: `http://127.0.0.1:${port}`,

      // Lee el pact JSON generado por el consumer test
      pactUrls: [
        path.resolve(__dirname, '../../../pacts/LicenseConsumer-LicensesService.json'),
      ],

      // Endpoint que prepara el estado de la BD antes de cada interacción
      providerStatesSetupUrl: `http://127.0.0.1:${port}/_pactState`,

      logLevel: 'warn',
    }).verifyProvider();
  }, 30_000);

});