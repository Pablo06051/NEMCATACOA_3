const express = require('express');
const { validate } = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const { registerSchema, loginSchema } = require('./auth.schemas');
const { asyncHandler } = require('../../utils/asyncHandler');
const { register, login } = require('./auth.controller');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(register));
router.post('/login',    authLimiter, validate(loginSchema),    asyncHandler(login));

module.exports = router;
