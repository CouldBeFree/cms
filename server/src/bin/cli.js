import { logger } from '../lib/logger'
import { env } from '../lib/env'
import mongoose from 'mongoose';
import 'regenerator-runtime/runtime';
import TasksService from '../services/TasksService';


void async function bootstrap() {
    const tasks = new TasksService();
    await tasks.init();

    tasks.runTask('migrate.fromold', {});
    process.exit(0);
}();
