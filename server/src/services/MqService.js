import nats from 'nats';
import { logger } from '../lib/logger';
import { env } from '../lib/env';

let nc;

export default class MqService {
    constructor(destination) {
        this.destination = destination;
    }

    static getClient() {
        return new Promise((resolve, reject) => {
            nc = nats.connect(env.NATS_ENPOINT || {});
            nc.on('error', reject);

            nc.on('connect', (nc) => {
                logger.info(`[MqService] Connected to ${nc.currentServer.url.host}`);
                resolve(nc)
            });

            nc.on('disconnect', function () {
                console.log('disconnect');
            });

            nc.on('reconnecting', function () {
                console.log('reconnecting');
            });

            nc.on('reconnect', function (nc) {
                console.log('reconnect');
            });

            nc.on('close', function () {
                console.log('close');
            });
        });
    }

    async connect() {
        this.natsServer = await MqService.getClient();
    }

    log(message) { // eslint-disable-line class-methods-use-this
        logger.info(`[MqService] ${message}`);
    }

    subscribe(onMessage) {
        this.log(`Subscribe to ${this.destination}`);
        this.channelSid = this.natsServer.subscribe(this.destination, body => {
            let msg;
            try {
                msg = JSON.parse(body);
            } catch (exception) {
                msg = body;
            }
            return onMessage(msg);
        });
    }

    push(body, next) {
        const message = JSON.stringify(body);
        const callback = (typeof next === 'function') ? next : () => {
        };
        this.log(`push message to ${this.destination}: ${message}`);

        this.natsServer.publish(this.destination, message, callback);
    }

    getOptions() {
        return this.options;
    }

    stop() {
        this.natsServer.unsubscribe(this.channelSid);
        this.natsServer.close();
    }
}
