module.exports = (err, req, res, next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    code: status,
    error: {
      type: err.type || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || null
    }
  });
};
