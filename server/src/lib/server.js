import * as http from 'http';
import Koa from 'koa';
import cors from '@koa/cors';
import respond from 'koa-respond';
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import DecRouter from 'koa-dec-router';
import noCache from 'koa-no-cache';
import cacheControl from 'koa-cache-control';

import { toSwaggerDoc, mixedValidate, ui } from '../joi-swagger';
import swaggerObj from '../swagger';

import { logger } from './logger';

import { notFoundHandler } from '../middleware/not-found';
import { errorHandler } from '../middleware/error-handler';
// import { companyDetect } from '../middleware/company-detect';

/**
 * Creates and returns a new Koa application.
 * Does *NOT* call `listen`!
 *
 * @return {Promise<http.Server>} The configured app.
 */
export async function createServer () {
  logger.debug('Creating server...');
  const app = new Koa();

  const decRouter = DecRouter({
    controllersDir: `${__dirname}/../controllers`
  });

  app.proxy = true;

  const swaggerDoc = toSwaggerDoc(swaggerObj);

  app
  // Top middleware is the error handler.
    .use(errorHandler)
    .use(helmet())
    .use(compress())
    // Adds ctx.ok(), ctx.notFound(), etc..
    .use(respond({
      methods: {
        imagePng: (ctx, img) => {
          ctx.type = 'image/png';
          ctx.body = img;
        }
      }
    }))
    // Handles CORS.
    .use(cors({
      credentials: true,
      origin: (ctx) => {
        return ctx.request.header.origin;
      }
    }))
    // Parses request bodies.
    .use(bodyParser())

    .use(noCache({
      paths: ['/api/(.*)'],
      types: ['json', 'application/json']
    }))
    .use(cacheControl({ noCache: true }))

    // .use(passport.initialize())
    // .use(passport.session())
    .use(ui(swaggerDoc, {
      pathRoot: '/swagger',
      skipPaths: []
    }))
    .use(mixedValidate(swaggerObj, {
      reqOpts: {
        stripUnknown: true
      },
      resOpts: {
        stripUnknown: true
      },
      onError: err => console.error(err)
    }))
    // .use(companyDetect)

    .use(decRouter.router.routes())
    .use(decRouter.router.allowedMethods())

    // Default handler when nothing stopped the chain.
    .use(notFoundHandler)
  ;

  // Creates a http server ready to listen.
  const server = http.createServer(app.callback());

  // Add a `close` event listener so we can clean up resources.
  server.on('close', () => {
    // You should tear down database connections, TCP connections, etc
    // here to make sure Jest's watch-mode some process management
    // tool does not release resources.
    logger.debug('Server closing, bye!');
  });

  logger.debug('Server created, ready to listen', { scope: 'startup' });
  return server;
}
