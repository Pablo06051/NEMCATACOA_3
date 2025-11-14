process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
process.env.BCRYPT_COST = '4';

const { hashPassword, verifyPassword } = require('../passwords');

describe('password utilities', () => {
  it('hashes a password with bcrypt and verifies it correctly', async () => {
    const plain = 'MySecret123';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(typeof hashed).toBe('string');
    expect(hashed.length).toBeGreaterThan(plain.length);

    const ok = await verifyPassword(plain, hashed);
    expect(ok).toBe(true);
  });

  it('fails verification with an incorrect password', async () => {
    const plain = 'AnotherSecret123';
    const hashed = await hashPassword(plain);

    const ok = await verifyPassword('wrongPassword', hashed);
    expect(ok).toBe(false);
  });
});
