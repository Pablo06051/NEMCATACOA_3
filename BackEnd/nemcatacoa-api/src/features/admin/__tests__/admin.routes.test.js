process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
process.env.BCRYPT_COST = process.env.BCRYPT_COST || '4';

const assert = require('node:assert/strict');
const Module = require('node:module');
const { describe, it } = require('node:test');

const authJwtPath = require.resolve('../../../middlewares/authJwt');
const requireRolePath = require.resolve('../../../middlewares/requireRole');
const routesPath = require.resolve('../admin.routes');

function createExpressStubRouter() {
  const router = {
    stack: [],
    use(...middlewares) {
      middlewares.forEach((fn) => {
        router.stack.push({ handle: fn });
      });
      return router;
    },
  };

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    router[method] = (path, handler) => {
      const route = {
        path,
        methods: { [method]: true },
        stack: [{ handle: handler }],
      };
      router.stack.push({ route, handle: handler });
      return router;
    };
  });

  return router;
}

function createResponseStub() {
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

describe('admin.routes', () => {
  it('registra la ruta para reactivar ciudades con los middleware esperados', () => {
    const expressStub = function express() {
      return { use() {} };
    };
    expressStub.Router = createExpressStubRouter;

    const jsonwebtokenStub = {
      verify: (_token, _secret) => ({ id: 'user-1', rol: 'admin', email: 'admin@example.com' }),
    };

    const originalLoad = Module._load;
    Module._load = function patchedLoad(request, parent, isMain) {
      if (request === 'express') {
        return expressStub;
      }
      if (request === 'jsonwebtoken') {
        return jsonwebtokenStub;
      }
      if (request === 'dotenv/config') {
        return {};
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    delete require.cache[authJwtPath];
    delete require.cache[requireRolePath];
    delete require.cache[routesPath];

    try {
      const { authJwt } = require(authJwtPath);
      const { requireRole } = require(requireRolePath);
      const router = require(routesPath);

      assert.ok(router.stack.length >= 3);

      const [firstLayer, secondLayer] = router.stack;
      assert.equal(firstLayer.handle, authJwt);

      const nonAdminReq = { user: { rol: 'user' } };
      const res = createResponseStub();
      let nextCalled = false;
      secondLayer.handle(nonAdminReq, res, () => {
        nextCalled = true;
      });
      assert.equal(res.statusCode, 403);
      assert.deepEqual(res.body, { error: 'No autorizado' });
      assert.equal(nextCalled, false);

      const adminReq = { user: { rol: 'admin' } };
      const adminRes = createResponseStub();
      let adminNextCalled = false;
      secondLayer.handle(adminReq, adminRes, () => {
        adminNextCalled = true;
      });
      assert.equal(adminRes.statusCode, 200);
      assert.equal(adminRes.body, null);
      assert.equal(adminNextCalled, true);

      const reactivarLayer = router.stack.find(
        (layer) => layer.route && layer.route.path === '/admin/ciudades/:id/reactivar'
      );

      assert.ok(reactivarLayer, 'La ruta PUT /admin/ciudades/:id/reactivar no está registrada');
      assert.ok(reactivarLayer.route.methods.put);
      const handler = reactivarLayer.route.stack[0].handle;
      assert.equal(typeof handler, 'function');
      assert.equal(handler.length, 3);
    } finally {
      Module._load = originalLoad;
      delete require.cache[authJwtPath];
      delete require.cache[requireRolePath];
      delete require.cache[routesPath];
    }
  });
});
