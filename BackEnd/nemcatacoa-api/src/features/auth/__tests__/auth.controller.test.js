process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
process.env.BCRYPT_COST = process.env.BCRYPT_COST || '4';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { createAuthController } = require('../auth.controller');

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('forgotPassword', () => {
  it('persists a token when the user exists and responds with 202', async () => {
    const queryCalls = [];
    const responses = [
      { rowCount: 1, rows: [{ id: 'user-1' }] },
      { rowCount: 1 },
    ];
    const queryStub = async (text, params) => {
      queryCalls.push({ text, params });
      return responses.shift();
    };

    const controller = createAuthController({
      db: {
        query: queryStub,
        pool: {
          connect: async () => {
            throw new Error('pool.connect should not be called');
          },
        },
      },
      randomUUID: () => 'token-123',
      dateProvider: () => new Date('2025-01-01T00:00:00.000Z'),
    });

    const res = createRes();
    await controller.forgotPassword({ body: { email: 'USER@example.com' } }, res);

    assert.equal(res.statusCode, 202);
    assert.deepEqual(res.body, {
      message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña.',
    });

    assert.equal(queryCalls.length, 2);
    assert.match(queryCalls[0].text, /FROM usuario/i);
    assert.deepEqual(queryCalls[0].params, ['user@example.com']);

    assert.match(queryCalls[1].text, /INSERT INTO password_reset_tokens/i);
    const [userId, tokenValue, expiresAt] = queryCalls[1].params;
    assert.equal(userId, 'user-1');
    assert.equal(tokenValue, 'token-123');
    const expectedExpiration = new Date('2025-01-01T01:00:00.000Z');
    assert.ok(expiresAt instanceof Date);
    assert.equal(expiresAt.toISOString(), expectedExpiration.toISOString());
  });

  it('does not create a token when the user does not exist', async () => {
    const queryCalls = [];
    const responses = [{ rowCount: 0, rows: [] }];
    const queryStub = async (text, params) => {
      queryCalls.push({ text, params });
      return responses.shift();
    };

    const controller = createAuthController({
      db: {
        query: queryStub,
        pool: {
          connect: async () => {
            throw new Error('pool.connect should not be called');
          },
        },
      },
      randomUUID: () => 'token-ignored',
      dateProvider: () => new Date('2025-01-01T00:00:00.000Z'),
    });

    const res = createRes();
    await controller.forgotPassword({ body: { email: 'missing@example.com' } }, res);

    assert.equal(res.statusCode, 202);
    assert.equal(queryCalls.length, 1);
    assert.match(queryCalls[0].text, /FROM usuario/i);
  });
});

describe('resetPassword', () => {
  const now = new Date('2025-01-01T00:00:00.000Z');
  let responsesQueue;
  let queryCalls;
  let released;
  let hashCalls;

  beforeEach(() => {
    responsesQueue = [];
    queryCalls = [];
    released = false;
    hashCalls = [];
  });

  function createController() {
    const client = {
      async query(text, params) {
        queryCalls.push({ text, params });
        if (responsesQueue.length === 0) {
          return {};
        }
        return responsesQueue.shift();
      },
      release() {
        released = true;
      },
    };

    return createAuthController({
      db: {
        pool: {
          connect: async () => client,
        },
      },
      passwords: {
        hashPassword: async (password) => {
          hashCalls.push(password);
          return 'hashed-password';
        },
      },
      dateProvider: () => now,
    });
  }

  it('updates the password and invalidates the token when it is valid', async () => {
    const expiresAt = new Date('2025-01-01T01:00:00.000Z').toISOString();
    responsesQueue = [
      {},
      {
        rowCount: 1,
        rows: [
          {
            id: 'token-1',
            user_id: 'user-1',
            expires_at: expiresAt,
            used_at: null,
          },
        ],
      },
      {},
      {},
      {},
      {},
    ];

    const controller = createController();
    const res = createRes();

    await controller.resetPassword({ body: { token: 'fake-token', password: 'NewPassword123' } }, res);

    assert.equal(hashCalls[0], 'NewPassword123');
    assert.equal(queryCalls[0].text, 'BEGIN');
    assert.match(queryCalls[1].text, /FROM password_reset_tokens/i);
    assert.match(queryCalls[2].text, /UPDATE usuario SET password_hash/i);
    assert.deepEqual(queryCalls[2].params, ['hashed-password', 'user-1']);
    assert.match(queryCalls[3].text, /UPDATE password_reset_tokens/i);
    assert.deepEqual(queryCalls[3].params, ['token-1']);
    assert.match(queryCalls[4].text, /DELETE FROM password_reset_tokens/i);
    assert.deepEqual(queryCalls[4].params, ['user-1', 'token-1']);
    assert.equal(queryCalls[5].text, 'COMMIT');
    assert.deepEqual(res.body, { message: 'Contraseña actualizada correctamente.' });
    assert.equal(released, true);
  });

  it('returns 400 when the token is missing', async () => {
    responsesQueue = [
      {},
      { rowCount: 0, rows: [] },
    ];

    const controller = createController();
    const res = createRes();

    await controller.resetPassword({ body: { token: 'invalid', password: 'whatever123' } }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'Token inválido o expirado' });
    const lastCall = queryCalls[queryCalls.length - 1];
    assert.equal(lastCall.text, 'ROLLBACK');
    assert.equal(released, true);
  });
});
