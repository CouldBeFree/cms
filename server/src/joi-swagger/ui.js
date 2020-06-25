import fs from 'fs'
import send from 'koa-send'
import path from 'path'
import { debug } from './utils';

export default function(document, {
    pathRoot = '/swagger',
    skipPaths = [],
    UIAssetsPath = null,
    swaggerConfig = '{}',
    sendConfig = { maxage: 3600 * 1000 * 24 * 30 },
  } = {}
) {
  const pathPrefix = pathRoot.endsWith('/') ? pathRoot.substring(0, pathRoot.length - 1) : pathRoot
  let html;

  fs.readFile(__dirname + '/index.html', 'utf8', function(err, contents) {
    html = contents;
  });

  return async (context, next) => {
    if (context.path.startsWith(pathRoot)) {
      const skipPath = skipPaths.some((path) => context.path.startsWith(path))
      if (context.path === pathRoot && context.method === 'GET') {
        context.type = 'text/html charset=utf-8'
        context.body = html
        context.status = 200
        return
      } else if (context.path.replace(/\.json$/, '') === (pathPrefix + '/api-docs') && context.method === 'GET') {
        context.type = 'application/json charset=utf-8'
        context.body = document
        context.status = 200
        return
      } else if (
        !skipPath &&
        context.path.startsWith(pathRoot + '/') &&
        context.method === 'GET'
      ) {
        const filePath = context.path.substring(pathRoot.length)
        await send(context, filePath, { root: UIAssetsPath, ...sendConfig })
        return
      }
    }
    return next()
  }
}
