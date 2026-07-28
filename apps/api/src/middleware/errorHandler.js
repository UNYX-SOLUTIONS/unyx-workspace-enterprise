export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  void req;
  void next;
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Error interno del servidor",
  });
}
