import { createServer } from '../lib/server';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import connect from '../lib/db';
import 'regenerator-runtime/runtime';
import SocketService from '../services/SocketService'

(async function bootstrap () {
  try {
    const server = await createServer();

    await connect(env.MONGO_SERVER);

    const socketService = new SocketService(server);
    await socketService.start();

    process.on('uncaughtException', (err) => {
      console.error({err: err}, 'Caught exception: ' + err.toString());
      socketService.stop();
      setTimeout(function () {
        process.exit(1);
      }, 500);
    });

    server.listen(env.API_PORT, () => {
      const mode = env.NODE_ENV;
      logger.debug(`Server listening on ${env.API_PORT} in ${mode} mode`);
    });
  } catch (err) {
    logger.error('Error while starting up server', err);
    process.exit(1);
  }

})();
