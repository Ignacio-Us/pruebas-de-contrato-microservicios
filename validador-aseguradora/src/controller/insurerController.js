const licenseClient = require('../clients/licenseClient');

const verifyLicense = async (req, res) => {
  try {
    const { folio } = req.params;
    const result = await licenseClient.verifyLicense(folio);
    
    // El requerimiento dicta propagar 200 en éxito y 404 si es inválida
    if (!result.valid) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
};

const getPatientLicenses = async (req, res) => {
  try {
    const { patientId } = req.params;
    const licenses = await licenseClient.getPatientLicenses(patientId);
    return res.status(200).json(licenses);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
};

module.exports = { verifyLicense, getPatientLicenses };