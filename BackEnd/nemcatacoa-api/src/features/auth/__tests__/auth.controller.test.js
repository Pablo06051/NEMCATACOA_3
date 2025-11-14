process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
process.env.BCRYPT_COST = process.env.BCRYPT_COST || '4';

const { describe, it } = require('node:test');
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
  it('updates the password and invalidates the token when it is valid', async () => {
    const futureDate = new Date('2025-01-01T01:00:00.000Z');
    const clientCalls = [];
    let released = false;
    let hashedInput = null;

    const client = {
      async query(text, params) {
        clientCalls.push({ text, params });
        if (/SELECT id, user_id/.test(text)) {
          return {
            rowCount: 1,
            rows: [
              {
                id: 'token-1',
                user_id: 'user-1',
                expires_at: futureDate.toISOString(),
                used_at: null,
              },
            ],
          };
        }
        return {};
      },
      release() {
        released = true;
      },
    };

    const controller = createAuthController({
      db: {
        query: async () => {
          throw new Error('db.query should not be used in resetPassword');
        },
        pool: {
          connect: async () => client,
        },
      },
      passwords: {
        hashPassword: async (value) => {
          hashedInput = value;
          return 'hashed-password';
        },
        verifyPassword: async () => {
          throw new Error('verifyPassword should not be called');
        },
      },
      dateProvider: () => new Date('2025-01-01T00:30:00.000Z'),
    });

    const res = createRes();
    await controller.resetPassword(
      { body: { token: '11111111-1111-1111-1111-111111111111', password: 'NewPassword123' } },
      res
    );

    assert.equal(hashedInput, 'NewPassword123');
    const statements = clientCalls.map((call) => call.text.trim());
    assert.equal(statements[0], 'BEGIN');
    assert.ok(statements.some((text) => /UPDATE usuario SET password_hash/.test(text)));
    assert.ok(statements.some((text) => /UPDATE password_reset_tokens/.test(text)));
    assert.ok(statements.some((text) => /DELETE FROM password_reset_tokens/.test(text)));
    assert.equal(statements.at(-1), 'COMMIT');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { message: 'Contraseña actualizada correctamente.' });
    assert.equal(released, true);
  });

  it('returns 400 when the token is missing or expired', async () => {
    const clientCalls = [];
    let released = false;

    const client = {
      async query(text) {
        clientCalls.push(text.trim());
        if (/SELECT id, user_id/.test(text)) {
          return { rowCount: 0, rows: [] };
        }
        return {};
      },
      release() {
        released = true;
      },
    };

    const controller = createAuthController({
      db: {
        query: async () => {
          throw new Error('db.query should not be used in resetPassword');
        },
        pool: {
          connect: async () => client,
        },
      },
      passwords: {
        hashPassword: async () => {
          throw new Error('hashPassword should not run');
        },
        verifyPassword: async () => {
          throw new Error('verifyPassword should not be called');
        },
      },
      dateProvider: () => new Date('2025-01-01T02:00:00.000Z'),
    });

    const res = createRes();
    await controller.resetPassword({ body: { token: 'invalid', password: 'whatever123' } }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'Token inválido o expirado' });
    assert.ok(clientCalls.includes('ROLLBACK'));
    assert.equal(released, true);
  });
});
