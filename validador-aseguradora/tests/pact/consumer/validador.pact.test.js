const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { LicenseClient } = require('../../src/clients/licenseClient');

const provider = new PactV3({
  consumer: 'ValidadorAseguradora',
  provider: 'LicenciasService',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Validador Aseguradora API Consumer Contract Tests', () => {
  describe('GET /licenses/{folio}/verify', () => {
    
    it('Positivo: devuelve valid:true para un folio existente y emitido', async () => {
      const folio = 'L-1001';
      
      provider
        .given('patient 11111111-1 has issued license folio L-1001')
        .uponReceiving('a request to verify a valid license')
        .withRequest({
          method: 'GET',
          path: `/licenses/${folio}/verify`
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { valid: true }
        });

      await provider.executeTest(async (mockServer) => {
        const client = new LicenseClient(mockServer.url);
        const response = await client.verifyLicense(folio);
        
        expect(response.valid).toBe(true);
      });
    });

    it('Negativo: devuelve valid:false para un folio que no existe', async () => {
      const folio = 'NOEXIST';

      provider
        .given('license NOEXIST does not exist')
        .uponReceiving('a request to verify a non-existent license')
        .withRequest({
          method: 'GET',
          path: `/licenses/${folio}/verify`
        })
        .willRespondWith({
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: { valid: false }
        });

      await provider.executeTest(async (mockServer) => {
        const client = new LicenseClient(mockServer.url);
        const response = await client.verifyLicense(folio);
        
        // Nuestro cliente Axios captura el 404 y lo transforma en valid: false
        expect(response.valid).toBe(false);
      });
    });

  });
});