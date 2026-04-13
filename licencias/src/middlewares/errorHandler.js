'use strict';

const errorHandler = (err, req, res, next) => {
  // Registra el error completo en consola para debugging interno

  console.error('[ErrorHandler]', {
    message: err.message,
    stack:   process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  // Si el error tiene un statusCode propio se usa, si no es un 500
  const status = err.statusCode || err.status || 500;

  const message = status === 500 ? 'INTERNAL_SERVER_ERROR' : err.message;

  return res.status(status).json({ error: message });
};

module.exports = { errorHandler };