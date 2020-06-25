import EventEmitter from 'events';
import jwt from 'jsonwebtoken';
import socketIo from 'socket.io';
import { env } from '../lib/env';
import { AccountRepository } from "../repositories/Account";
import MqService from "./MqService";

export default class SocketService extends EventEmitter {
  constructor(server) {
    super() // required

    this.sockets = [];

    this.io = socketIo(server, {
      serveClient: false,
      path: '/api/v1/socket'
    });
    this.mqService = new MqService('socket');
  }

  sendToAccount(accountId, event, data) {
    this.mqService.push({ accountId, event, data });
  }

  async processMessage ({ accountId, event, data }) {
    const sockets = this.sockets[accountId];
    if (sockets && sockets.length > 0) {
      console.info(`Sending event "${event}" to account ${accountId} sockets - ${sockets.length}`);
      sockets.forEach(socket => {
        if (typeof socket !== 'undefined' && typeof socket.emit === 'function') {
          socket.emit(event, data);
        }
      });
    }
  }

  async start(subscribe = true) {
    console.info('Initializing socket service...');
    const io = this.io;
    await this.mqService.connect();
    if (subscribe) {
      this.mqService.subscribe(this.processMessage.bind(this));

      io.use((socket, next) => this.onHandshake(socket).then(next).catch(err => next(null, err)));
      io.on('connection', (socket) => {
        const name = socket.account && socket.account.username ? socket.account.username : 'anonymous';

        console.info(`Socket connection from "${name}" started`);
        socket.on('disconnect', () => console.info(`Socket connection from "${name}" closed`));

        socket.on('runImport', () => {
          this.sendToAccount(socket.account._id, 'test', 'message');
        })
      });
    }
    console.info('Socket service initialized successfully');
  }

  stop () {
    this.mqService.stop();
  }

  async onHandshake(socket) {
    const handshake = socket.request;
    if (typeof handshake._query === 'undefined' || typeof handshake._query.token === 'undefined' || !handshake._query.token.length) {
      console.info('Unauthorized socket connection');
      throw new Error('unauthorized');
    }
    const payload = jwt.decode(handshake._query.token, env.JWT_SECRET);
    if (!payload) {
      console.info('Unauthorized socket connection');
      throw new Error('unauthorized');
    }
    const account = await AccountRepository.getAccountById(payload.accountId);
    if (!account) {
      console.info('Unauthorized socket connection (invalid token)');
      throw new Error('unauthorized');
    }
    socket.account = account.toObject();
    this.addSocket(socket);
    socket.on('disconnect', () => this.removeSocket(socket));

    next();
  }

  addSocket(socket) {
    const id = socket.account._id.toString();

    this.sockets[id] = this.sockets[id] || [];
    this.sockets[id].push(socket);

    const stat = this.getSocketsStat();
    console.info(`Connected ${stat.totalSockets} sockets from ${stat.totalAccounts} accounts`);
  }

  removeSocket(socket) {
    const id = socket.account._id.toString();

    if (this.sockets[id]) {
      var index = this.sockets[id].indexOf(socket);
      if (index > -1) {
        this.sockets[id].splice(index, 1);
        if (this.sockets[id].length === 0) {
          delete this.sockets[id];
        }
      }
    }

    const stat = this.getSocketsStat();
    console.info(`Connected ${stat.totalSockets} sockets from ${stat.totalAccounts} accounts`);
  }

  getSocketsStat() {
    return Object.values(this.sockets).reduce((stat, acc) => {
      stat.totalAccounts += 1;
      stat.totalSockets += acc.length || 0;
      return stat;
    }, {totalAccounts: 0, totalSockets: 0});
  };
}
