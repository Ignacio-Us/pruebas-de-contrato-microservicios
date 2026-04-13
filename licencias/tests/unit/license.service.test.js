'use strict';

const {
  licenseService,
  InvalidDaysError,
  LicenseNotFoundError,
} = require('../../src/services/license.service');

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DEL REPOSITORIO
// Ahora incluye generateFolio() que reemplaza a uuidv4()
// ═══════════════════════════════════════════════════════════════════════════
jest.mock('../../src/repositories/license.repository', () => ({
  generateFolio:   jest.fn(),
  create:          jest.fn(),
  findByFolio:     jest.fn(),
  findByPatientId: jest.fn(),
}));

const licenseRepository = require('../../src/repositories/license.repository');

// ═══════════════════════════════════════════════════════════════════════════
// DATOS DE PRUEBA
// ═══════════════════════════════════════════════════════════════════════════

const validDto = {
  patientId: '11111111-1',
  doctorId:  'DOC-123',
  diagnosis: 'Influenza A',
  startDate: '2024-06-01',
  days:      7,
};

const storedLicense = {
  folio:     'L-1001',
  patientId: '11111111-1',
  doctorId:  'DOC-123',
  diagnosis: 'Influenza A',
  startDate: '2024-06-01',
  days:      7,
  status:    'issued',
};

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('LicenseService', () => {

  beforeEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────────────────────────────
  describe('issueLicense()', () => {

    it('debe crear una licencia con folio L-1001 y status "issued"', async () => {
      licenseRepository.generateFolio.mockResolvedValue('L-1001');
      licenseRepository.create.mockResolvedValue();

      const result = await licenseService.issueLicense(validDto);

      expect(licenseRepository.generateFolio).toHaveBeenCalledTimes(1);
      expect(licenseRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        folio:     'L-1001',
        patientId: '11111111-1',
        doctorId:  'DOC-123',
        diagnosis: validDto.diagnosis,
        startDate: validDto.startDate,
        days:      validDto.days,
        status:    'issued',
      });
    });

    it('debe lanzar InvalidDaysError cuando days es 0', async () => {
      await expect(
        licenseService.issueLicense({ ...validDto, days: 0 })
      ).rejects.toThrow(InvalidDaysError);

      expect(licenseRepository.generateFolio).not.toHaveBeenCalled();
      expect(licenseRepository.create).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidDaysError cuando days es negativo', async () => {
      await expect(
        licenseService.issueLicense({ ...validDto, days: -5 })
      ).rejects.toThrow(InvalidDaysError);

      expect(licenseRepository.generateFolio).not.toHaveBeenCalled();
      expect(licenseRepository.create).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidDaysError cuando days es null', async () => {
      await expect(
        licenseService.issueLicense({ ...validDto, days: null })
      ).rejects.toThrow(InvalidDaysError);

      expect(licenseRepository.generateFolio).not.toHaveBeenCalled();
      expect(licenseRepository.create).not.toHaveBeenCalled();
    });

  });

  // ─────────────────────────────────────────────────────────────────────
  describe('getLicense()', () => {

    it('debe retornar la licencia cuando el folio existe', async () => {
      licenseRepository.findByFolio.mockResolvedValue(storedLicense);

      const result = await licenseService.getLicense('L-1001');

      expect(result).toEqual(storedLicense);
    });

    it('debe lanzar LicenseNotFoundError cuando el folio no existe', async () => {
      licenseRepository.findByFolio.mockResolvedValue(null);

      await expect(
        licenseService.getLicense('L-404')
      ).rejects.toThrow(LicenseNotFoundError);
    });

  });

  // ─────────────────────────────────────────────────────────────────────
  describe('getLicensesByPatient()', () => {

    it('debe retornar array de licencias cuando el paciente tiene registros', async () => {
      licenseRepository.findByPatientId.mockResolvedValue([storedLicense]);

      const result = await licenseService.getLicensesByPatient('11111111-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío cuando el paciente no tiene licencias', async () => {
      licenseRepository.findByPatientId.mockResolvedValue([]);

      const result = await licenseService.getLicensesByPatient('22222222-2');

      expect(result).toEqual([]);
    });

  });

  // ─────────────────────────────────────────────────────────────────────
  describe('verifyLicense()', () => {

    it('debe retornar { valid: true } cuando status es "issued"', async () => {
      licenseRepository.findByFolio.mockResolvedValue(storedLicense);

      const result = await licenseService.verifyLicense('L-1001');

      expect(result).toEqual({ valid: true });
    });

    it('debe retornar { valid: false } cuando status no es "issued"', async () => {
      licenseRepository.findByFolio.mockResolvedValue({
        ...storedLicense,
        status: 'revoked',
      });

      const result = await licenseService.verifyLicense('L-1001');

      expect(result).toEqual({ valid: false });
    });

    it('debe lanzar LicenseNotFoundError cuando el folio no existe', async () => {
      licenseRepository.findByFolio.mockResolvedValue(null);

      await expect(
        licenseService.verifyLicense('L-404')
      ).rejects.toThrow(LicenseNotFoundError);
    });

  });

});