import { logger } from '../lib/logger'
import { env } from '../lib/env'
import mongoose from 'mongoose';
import 'regenerator-runtime/runtime';
import TasksService from '../services/TasksService';
import SocketService from '../services/SocketService';
import connect, { initConnection } from '../lib/db';


void async function bootstrap() {
    await connect(env.MONGO_SERVER);

    await initConnection(env);

    const tasks = new TasksService();
    tasks.socketService = new SocketService();
    await tasks.socketService.start(false);

    await tasks.init();

    tasks.subscribe();
}();
