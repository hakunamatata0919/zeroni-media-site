const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function createApplication() {
  const routeHandlers = [];
  const middlewares = [];

  function use(arg1, arg2) {
    if (typeof arg1 === 'function') {
      middlewares.push({ path: '/', handler: arg1 });
      return;
    }
    if (typeof arg1 === 'string' && typeof arg2 === 'function') {
      middlewares.push({ path: arg1, handler: arg2 });
    }
  }

  function addRoute(method, routePath, handler) {
    routeHandlers.push({ method, routePath, handler });
  }

  function get(routePath, handler) { addRoute('GET', routePath, handler); }
  function post(routePath, handler) { addRoute('POST', routePath, handler); }
  function del(routePath, handler) { addRoute('DELETE', routePath, handler); }

  function matchRoute(routePath, pathname) {
    if (routePath === '/' && pathname === '/') return {};
    const routeParts = routePath.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) return null;
    const params = {};
    for (let i = 0; i < routeParts.length; i += 1) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = decodeURIComponent(pathPart);
      } else if (routePart !== pathPart) {
        return null;
      }
    }
    return params;
  }

  function runMiddleware(req, res, idx, done) {
    if (idx >= middlewares.length) return done();
    const item = middlewares[idx];
    const pathname = req.path || '/';
    if (item.path === '/' || pathname === item.path || pathname.startsWith(item.path + '/')) {
      item.handler(req, res, () => runMiddleware(req, res, idx + 1, done));
    } else {
      runMiddleware(req, res, idx + 1, done);
    }
  }

  function handleRequest(req, res) {
    const urlObj = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    req.path = urlObj.pathname;
    req.query = Object.fromEntries(urlObj.searchParams.entries());
    req.params = {};

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      let finished = false;
      const finish = (code, payload, contentType) => {
        if (finished) return;
        finished = true;
        if (typeof payload === 'undefined') {
          res.statusCode = code || 200;
          res.end();
          return;
        }
        res.statusCode = code || 200;
        res.setHeader('Content-Type', contentType || 'application/json; charset=utf-8');
        res.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
      };

      res.json = (payload) => finish(200, payload, 'application/json; charset=utf-8');
      res.send = (payload) => finish(200, payload, typeof payload === 'string' ? 'text/plain; charset=utf-8' : 'application/octet-stream');
      res.sendFile = (filePath) => {
        const fullPath = path.resolve(filePath);
        fs.readFile(fullPath, (err, data) => {
          if (err) return finish(404, 'not found', 'text/plain; charset=utf-8');
          const ext = path.extname(fullPath).toLowerCase();
          const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.css' ? 'text/css; charset=utf-8' : ext === '.js' ? 'application/javascript; charset=utf-8' : ext === '.json' ? 'application/json; charset=utf-8' : 'application/octet-stream';
          res.statusCode = 200;
          res.setHeader('Content-Type', type);
          res.end(data);
        });
      };
      res.status = (code) => ({ json: (payload) => finish(code, payload, 'application/json; charset=utf-8'), send: (payload) => finish(code, payload, typeof payload === 'string' ? 'text/plain; charset=utf-8' : 'application/octet-stream') });

      runMiddleware(req, res, 0, () => {
        const route = routeHandlers.find(item => item.method === req.method && matchRoute(item.routePath, req.path));
        if (!route) {
          if (req.path === '/') {
            finish(404, { error: 'not found' });
            return;
          }
          finish(404, { error: 'not found' });
          return;
        }
        req.params = matchRoute(route.routePath, req.path) || {};
        route.handler(req, res);
      });
    });
  }

  function listen(port, cb) {
    const server = http.createServer(handleRequest);
    server.listen(port, () => {
      if (cb) cb();
    });
    return server;
  }

  return { use, get, post, delete: del, listen };
}

function jsonParser() {
  return (req, res, next) => {
    next();
  };
}

function staticMiddleware(root) {
  return (req, res, next) => {
    const pathname = req.path || '/';
    const decodedPath = decodeURIComponent(pathname);
    const safePath = decodedPath === '/' ? '/index.html' : decodedPath;
    const normalizedPath = path.normalize(safePath).replace(/^([\\/])+/, '');
    const fullPath = path.join(root, normalizedPath);
    const resolvedRoot = path.resolve(root);
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      next();
      return;
    }
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      res.sendFile(fullPath);
      return;
    }
    next();
  };
}

module.exports = createApplication;
module.exports.json = jsonParser;
module.exports.static = staticMiddleware;
