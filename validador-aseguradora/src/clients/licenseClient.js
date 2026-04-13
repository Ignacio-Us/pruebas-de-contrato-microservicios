const axios = require('axios');

const LICENSES_SERVICE_URL = process.env.LICENSES_SERVICE_URL || 'http://localhost:3001';

class LicenseClient {
  constructor(baseURL = LICENSES_SERVICE_URL) {
    this.api = axios.create({
      baseURL,
      timeout: 5000,
    });
  }

  async verifyLicense(folio) {
    try {
      const response = await this.api.get(`/licenses/${folio}/verify`);
      return response.data; // Retorna { valid: true }
    } catch (error) {
      // Regla de negocio: Si el servicio dice 404, la licencia no es válida
      if (error.response && error.response.status === 404) {
        return { valid: false };
      }
      throw new Error(`License Service Error: ${error.message}`);
    }
  }

  async getPatientLicenses(patientId) {
    try {
      const response = await this.api.get('/licenses', { params: { patientId } });
      return response.data;
    } catch (error) {
      throw new Error('License Service Unavailable');
    }
  }
}

module.exports = new LicenseClient();