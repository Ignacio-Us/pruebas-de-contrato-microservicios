const app = require('./app');
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`[Portal Paciente] Service running on port ${PORT}`);
});