process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'secret';
process.env.BCRYPT_COST = '4';

const queryMock = jest.fn();
const clientQueryMock = jest.fn();
const releaseMock = jest.fn();

jest.mock('../../../db', () => ({
  query: (...args) => queryMock(...args),
  pool: {
    connect: async () => ({
      query: (...args) => clientQueryMock(...args),
      release: releaseMock,
    }),
  },
}));

jest.mock('../../../utils/passwords', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed-password')),
  verifyPassword: jest.fn(),
}));

const { forgotPassword, resetPassword } = require('../auth.controller');
const { hashPassword } = require('../../../utils/passwords');

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
  beforeEach(() => {
    queryMock.mockReset();
  });

  it('persists a token when the user exists and responds with 202', async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'user-1' }] })
      .mockResolvedValueOnce({ rowCount: 1 });

    const req = { body: { email: 'USER@example.com' } };
    const res = createRes();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(202);
    expect(res.body).toEqual({
      message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña.',
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM usuario'),
      ['user@example.com']
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO password_reset_tokens'),
      [
        'user-1',
        expect.any(String),
        expect.any(Date),
      ]
    );
  });

  it('does not create a token when the user does not exist', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { body: { email: 'missing@example.com' } };
    const res = createRes();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(202);
    expect(queryMock).toHaveBeenCalledTimes(1);
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
