'use strict';

const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { like }               = MatchersV3;
const path                   = require('path');
const supertest              = require('supertest');

const provider = new PactV3({
  consumer: 'LicenseConsumer',
  provider: 'LicensesService',
  dir:      path.resolve(__dirname, '../../../pacts'),
  logLevel: 'warn',
});

const VALID_PATIENT = '11111111-1';
const VALID_DOCTOR  = 'DOC-123';

const licenseBody = {
  folio:     like('L-1001'),
  patientId: like(VALID_PATIENT),
  doctorId:  like(VALID_DOCTOR),
  diagnosis: like('Influenza A'),
  startDate: like('2024-06-01'),
  days:      like(7),
  status:    like('issued'),
};

describe('LicenseConsumer Pact', () => {

  describe('POST /licenses', () => {

    // POSITIVO
    it('201 — emite una licencia cuando days > 0', async () => {
      await provider.addInteraction({
        states: [{ description: 'issued license days>0 is creatable' }],
        uponReceiving: 'una solicitud para emitir una licencia válida',
        withRequest: {
          method:  'POST',
          path:    '/licenses',
          headers: { 'Content-Type': 'application/json' },
          body: {
            patientId: VALID_PATIENT,
            doctorId:  VALID_DOCTOR,
            diagnosis: 'Influenza A',
            startDate: '2024-06-01',
            days:      7,
          },
        },
        willRespondWith: {
          status:  201,
          headers: { 'Content-Type': like('application/json') },
          body:    licenseBody,
        },
      });

      await provider.executeTest(async (mockServer) => {
        const res = await supertest(mockServer.url)
          .post('/licenses')
          .set('Content-Type', 'application/json')
          .send({
            patientId: VALID_PATIENT,
            doctorId:  VALID_DOCTOR,
            diagnosis: 'Influenza A',
            startDate: '2024-06-01',
            days:      7,
          });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('issued');
        expect(res.body.folio).toBeDefined();
      });
    });

    //  NEGATIVO
    it('400 — rechaza la emisión cuando days <= 0', async () => {
      await provider.addInteraction({
        states: [{ description: 'issued license days>0 is creatable' }],
        uponReceiving: 'una solicitud para emitir una licencia con days inválidos',
        withRequest: {
          method:  'POST',
          path:    '/licenses',
          headers: { 'Content-Type': 'application/json' },
          body: {
            patientId: VALID_PATIENT,
            doctorId:  VALID_DOCTOR,
            diagnosis: 'Resfriado',
            startDate: '2024-06-01',
            days:      0,
          },
        },
        willRespondWith: {
          status: 400,
          body:   { error: 'INVALID_DAYS' },
        },
      });

      await provider.executeTest(async (mockServer) => {
        const res = await supertest(mockServer.url)
          .post('/licenses')
          .set('Content-Type', 'application/json')
          .send({
            patientId: VALID_PATIENT,
            doctorId:  VALID_DOCTOR,
            diagnosis: 'Resfriado',
            startDate: '2024-06-01',
            days:      0,
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('INVALID_DAYS');
      });
    });

  });

});