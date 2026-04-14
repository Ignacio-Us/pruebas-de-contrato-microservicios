const axios = require('axios');

const LICENSES_SERVICE_URL = process.env.LICENSES_SERVICE_URL || 'http://localhost:3001';

// Cliente HTTP para comunicarse con el microservicio de Licencias.

class LicenseClient {
  constructor(baseURL = LICENSES_SERVICE_URL) {
    this.api = axios.create({
      baseURL,
      timeout: 5000,
    });
  }

  async getLicensesByPatientId(patientId) {
    try {
      const response = await this.api.get('/licenses', {
        params: { patientId }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`License Service Error: ${error.response.status}`);
      }
      throw new Error('License Service Unavailable');
    }
  }
}

module.exports = { LicenseClient };