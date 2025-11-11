// envuelve handlers async para no repetir try/catch
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
module.exports = { asyncHandler };
