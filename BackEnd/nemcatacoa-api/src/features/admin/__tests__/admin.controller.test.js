const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { asyncHandler } = require('../../../utils/asyncHandler');

function createQueryMock() {
  let implementation = async () => ({ rowCount: 1, rows: [] });
  const calls = [];

  const mock = async (...args) => {
    calls.push(args);
    return implementation(...args);
  };

  mock.setImplementation = (fn) => {
    implementation = fn;
  };

  mock.clear = () => {
    calls.length = 0;
    implementation = async () => ({ rowCount: 1, rows: [] });
  };

  mock.calls = calls;

  return mock;
}

const queryMock = createQueryMock();
const dbModulePath = path.resolve(__dirname, '../../../db.js');
require.cache[dbModulePath] = { exports: { query: queryMock } };

const {
  updateUsuario,
  desactivarCiudad,
  reactivarCiudad,
  resolverSugerencia,
} = require('../admin.controller');

function createRes() {
  const statusCalls = [];
  const jsonCalls = [];
  return {
    statusCalls,
    jsonCalls,
    status(code) {
      statusCalls.push(code);
      return this;
    },
    json(payload) {
      jsonCalls.push(payload);
      return this;
    },
  };
}

beforeEach(() => {
  queryMock.clear();
});

test('updateUsuario actualiza rol y estado y responde con confirmación', async () => {
  const req = {
    params: { id: 'user-1' },
    body: { rol: 'admin', estado: 'activo' },
  };
  const res = createRes();

  await updateUsuario(req, res);

  assert.equal(queryMock.calls.length, 1);
  const [sql, params] = queryMock.calls[0];
  assert.ok(sql.includes('UPDATE usuario'));
  assert.ok(sql.includes('SET rol = COALESCE($2, rol)'));
  assert.ok(sql.includes('estado = COALESCE($3, estado)'));
  assert.deepEqual(params, ['user-1', 'admin', 'activo']);
  assert.deepEqual(res.jsonCalls[0], { ok: true, message: 'Usuario actualizado' });
});

test('desactivarCiudad envía la consulta correcta y responde con éxito', async () => {
  const req = { params: { id: 'city-77' } };
  const res = createRes();

  await desactivarCiudad(req, res);

  assert.equal(queryMock.calls.length, 1);
  const [sql, params] = queryMock.calls[0];
  assert.equal(sql, "UPDATE ciudad SET estado = 'inactivo' WHERE id = $1");
  assert.deepEqual(params, ['city-77']);
  assert.deepEqual(res.jsonCalls[0], { ok: true, message: 'Ciudad desactivada' });
});

test('reactivarCiudad actualiza el estado a activo y responde con éxito', async () => {
  const req = { params: { id: 'city-42' } };
  const res = createRes();

  await reactivarCiudad(req, res);

  assert.equal(queryMock.calls.length, 1);
  const [sql, params] = queryMock.calls[0];
  assert.equal(sql, "UPDATE ciudad SET estado = 'activo' WHERE id = $1");
  assert.deepEqual(params, ['city-42']);
  assert.deepEqual(res.jsonCalls[0], { ok: true, message: 'Ciudad reactivada' });
});

test('reactivarCiudad propaga errores de la base de datos para IDs inexistentes', async () => {
  const req = { params: { id: 'missing-city' } };
  const res = createRes();
  const capturedErrors = [];
  const error = new Error('Ciudad no encontrada');

  queryMock.setImplementation(async () => {
    throw error;
  });

  const handler = asyncHandler(reactivarCiudad);
  await handler(req, res, (err) => {
    capturedErrors.push(err);
  });

  assert.equal(queryMock.calls.length, 1);
  const [sql, params] = queryMock.calls[0];
  assert.equal(sql, "UPDATE ciudad SET estado = 'activo' WHERE id = $1");
  assert.deepEqual(params, ['missing-city']);
  assert.equal(capturedErrors.length, 1);
  assert.strictEqual(capturedErrors[0], error);
  assert.equal(res.jsonCalls.length, 0);
});

test('resolverSugerencia actualiza los campos de seguimiento y devuelve confirmación', async () => {
  const req = {
    params: { id: 'sug-5' },
    body: { estado: 'resuelta', respuesta_admin: 'Gracias por tu aporte' },
    user: { id: 'admin-99' },
  };
  const res = createRes();

  await resolverSugerencia(req, res);

  assert.equal(queryMock.calls.length, 1);
  const [sql, params] = queryMock.calls[0];
  assert.ok(sql.includes('UPDATE sugerencia'));
  assert.ok(sql.includes('SET estado = COALESCE($2, estado)'));
  assert.ok(sql.includes('respuesta_admin = $3'));
  assert.ok(sql.includes('id_admin_respuesta = $4'));
  assert.deepEqual(params, ['sug-5', 'resuelta', 'Gracias por tu aporte', 'admin-99']);
  assert.deepEqual(res.jsonCalls[0], { ok: true, message: 'Sugerencia actualizada' });
});
