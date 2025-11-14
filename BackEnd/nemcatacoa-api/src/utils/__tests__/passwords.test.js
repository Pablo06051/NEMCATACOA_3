process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
process.env.BCRYPT_COST = '4';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { hashPassword, verifyPassword } = require('../passwords');

describe('password utilities', () => {
  it('hashes a password with bcrypt and verifies it correctly', async () => {
    const plain = 'MySecret123';
    const hashed = await hashPassword(plain);

    assert.notEqual(hashed, plain);
    assert.equal(typeof hashed, 'string');
    assert.ok(hashed.length > plain.length);

    const ok = await verifyPassword(plain, hashed);
    assert.equal(ok, true);
  });

  it('fails verification with an incorrect password', async () => {
    const plain = 'AnotherSecret123';
    const hashed = await hashPassword(plain);

    const ok = await verifyPassword('wrongPassword', hashed);
    assert.equal(ok, false);
  });
});
