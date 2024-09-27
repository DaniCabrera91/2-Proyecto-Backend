const handleValidationError = (err, res) => {
    let errors = Object.values(err.errors).map(el => el.message)
    res.status(400).send({ messages: errors.length > 1 ? errors.join(" || ") : errors[0] })
  };
  
  const typeError = (err, req, res, next) => {
    console.error(err);
    if (err.name === 'ValidationError') {
      return handleValidationError(err, res)
    }
    if (err.code === 11000) {
      return res.status(400).send({ message: 'El correo ya está registrado. Debe ser único.' })
    }
    if (err.name === 'UnauthorizedError') {
      return res.status(401).send({ message: 'Tu sesión ha expirado. Inicia sesión nuevamente.' })
    }
    res.status(500).send({ message: 'Hubo un problema. Intenta nuevamente.' })
  }
  
  module.exports = { typeError }
  