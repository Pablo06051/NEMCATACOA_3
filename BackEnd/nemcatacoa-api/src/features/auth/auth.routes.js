const express = require('express');
const { validate } = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const { authJwt } = require('../../middlewares/authJwt');
const { requireRole } = require('../../middlewares/requireRole');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerProveedorSchema,
} = require('./auth.schemas');
const { asyncHandler } = require('../../utils/asyncHandler');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  registerProveedor,
} = require('./auth.controller');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login));
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);
router.post(
  '/register-proveedor',
  authLimiter,
  validate(registerProveedorSchema),
  asyncHandler(registerProveedor)
);

module.exports = router;
