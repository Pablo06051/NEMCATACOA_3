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
  beforeEach(() => {
    clientQueryMock.mockReset();
    releaseMock.mockReset();
    hashPassword.mockClear();
  });

  it('updates the password and invalidates the token when it is valid', async () => {
    const fakeToken = '11111111-1111-1111-1111-111111111111';
    const futureDate = new Date(Date.now() + 10 * 60 * 1000);

    clientQueryMock
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'token-1',
            user_id: 'user-1',
            expires_at: futureDate.toISOString(),
            used_at: null,
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const req = { body: { token: fakeToken, password: 'NewPassword123' } };
    const res = createRes();

    await resetPassword(req, res);

    expect(clientQueryMock).toHaveBeenCalledWith('BEGIN');
    expect(hashPassword).toHaveBeenCalledWith('NewPassword123');
    expect(clientQueryMock).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE usuario SET password_hash'),
      ['hashed-password', 'user-1']
    );
    expect(clientQueryMock).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE password_reset_tokens'),
      ['token-1']
    );
    expect(clientQueryMock).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM password_reset_tokens'),
      ['user-1', 'token-1']
    );
    expect(clientQueryMock).toHaveBeenCalledWith('COMMIT');
    expect(res.body).toEqual({ message: 'Contraseña actualizada correctamente.' });
    expect(releaseMock).toHaveBeenCalled();
  });

  it('returns 400 when the token is missing', async () => {
    clientQueryMock
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { body: { token: 'invalid', password: 'whatever123' } };
    const res = createRes();

    await resetPassword(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Token inválido o expirado' });
    expect(clientQueryMock).toHaveBeenCalledWith('ROLLBACK');
  });
});
