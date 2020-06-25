import { createServer } from '../lib/server';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import connect from '../lib/db';
import 'regenerator-runtime/runtime';
import { AccountRepository } from '../repositories/Account';

(async function bootstrap () {
  try {
    await connect(env.MONGO_SERVER);

    const owner = await AccountRepository.createDataOwner();
    const account = await AccountRepository.createAccount(owner, 'admin', 'admin');

    account.activated = true;
    await account.save();

    console.info(account);
  } catch (err) {
    logger.error('Error while starting up server', err);
  }
  process.exit(0);
})();
