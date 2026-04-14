const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { LicenseClient } = require('../../../src/clients/licenseClient');

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  consumer: 'PortalPaciente',
  provider: 'LicenciasService',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Portal Paciente API Consumer Contract Tests', () => {
  describe('GET /licenses?patientId={id}', () => {
    
    it('Positivo: devuelve una lista con al menos 1 licencia', async () => {
      const patientId = '11111111-1';

      provider
        .given('patient 11111111-1 has issued license folio L-1001')
        .uponReceiving('a request for patient licenses')
        .withRequest({
          method: 'GET',
          path: '/licenses',
          query: { patientId }
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: eachLike({
            folio: 'L-1001',
            patientId: patientId,
            doctorId: like('DOC-123'),
            diagnosis: like('Gripe'),
            startDate: like('2026-04-08'),
            days: like(7),
            status: 'issued'
          })
        });

      await provider.executeTest(async (mockServer) => {
        const client = new LicenseClient(mockServer.url);
        const response = await client.getLicensesByPatientId(patientId);
        
        expect(response).toBeDefined();
        expect(Array.isArray(response)).toBe(true);
        expect(response[0].folio).toBe('L-1001');
      });
    });

    it('Borde: devuelve un arreglo vacío si no hay licencias', async () => {
      const patientId = '22222222-2';

      provider
        .given('no licenses for patient 22222222-2')
        .uponReceiving('a request for an empty license list')
        .withRequest({
          method: 'GET',
          path: '/licenses',
          query: { patientId }
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: []
        });

      await provider.executeTest(async (mockServer) => {
        const client = new LicenseClient(mockServer.url);
        const response = await client.getLicensesByPatientId(patientId);
        
        expect(response).toBeDefined();
        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBe(0);
      });
    });

  });
});