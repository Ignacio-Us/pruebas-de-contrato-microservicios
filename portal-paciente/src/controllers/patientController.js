const licenseClient = require('../clients/licenseClient');

const getPatientLicenses = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const licenses = await licenseClient.getLicensesByPatientId(patientId);
    
    return res.status(200).json(licenses);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
};

module.exports = {
  getPatientLicenses
};