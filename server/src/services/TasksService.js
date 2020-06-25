import fs from 'fs';
import path from 'path';
import { logger } from '../lib/logger';
import MqService from './MqService';

export default class TasksService {
  constructor (app, options = {}) {
    this.id = options.id || 'tasks';
    this.app = app;
    this.plugins = {};
    this.options = options || {};
    this.options.pluginsPath = this.options.pluginsPath || path.join(__dirname, '..', 'tasks');

    this.mqService = new MqService(`${this.id}`);
  }

  async init () {
    this.loadPlugins();
    await this.mqService.connect();
  }

  log (message) { // eslint-disable-line class-methods-use-this
    logger.info(`[TasksService] ${message}`);
  }

  async loadPlugins (cb) {
    this.log('Loading tasks plugins started:', this.options.pluginsPath);
    const fileList = await dirWalk(this.options.pluginsPath);

    for (let filePath of fileList) {
      if (path.extname(filePath) !== '.js') {
        continue;
      }
      await this.registerPlugin(filePath);
    }
    const pluginsCount = Object.keys(this.plugins).length;
    if (pluginsCount === 0) {
      logger.warn('Tasks plugins loading procedure complete successfully, but plugins not found');
    } else {
      this.log(`Tasks plugins loaded successfully - ${pluginsCount}`);
    }
  }

  async registerPlugin (pluginFilename) {
    this.log(`Loading tasks plugins from file "${pluginFilename}"`);

    let plugin = require(pluginFilename); // eslint-disable-line global-require
    plugin = plugin.default || plugin;

    Object.keys(plugin).forEach((taskName) => {
      const taskHandler = plugin[taskName];
      if (!this.plugins[taskName]) {
        this.plugins[taskName] = [];
      }
      this.plugins[taskName].push(taskHandler);
    });
  }

  subscribe () {
    this.log(`Subscribed to ${this.id}`);
    this.mqService.subscribe(this.processMessage.bind(this));
  }

  runTask (name, options = {}, next) {
    this.log(`Task "${name}" pushed`, options);

    this.mqService.push({ name, options }, next);
  }

  async processMessage ({ name, options }) {
    const handlers = this.plugins[name] || [];

    if (!handlers.length) {
      return this.log(`Event "${name}" processed successfully without executing tasks`);
    }
    this.log(`Event "${name}" started tasks(${handlers.length})...`);

    for (let handler of handlers) {
      try {
        await handler(this, { name, options });
      } catch (err) {
        return logger.error(err);
      }
    }
    this.log(`Event "${name}" processed successfully. Executed tasks - ${handlers.length}`);
  }

  stop () {
    this.mqService.stop();
  }
}

function dirWalk (dir) {
  let results = [];

  return new Promise((resolve, reject) => {
    fs.readdir(dir, (errDir, list) => {
      if (errDir) {
        return cb(errDir);
      }

      let i = 0;
      return next()

      function next () {
        let file = list[i];
        i += 1;
        if (!file) {
          return resolve(results);
        }
        file = path.join(dir, file);
        return fs.stat(file, async (err, stat) => {
          if (err) {
            return reject(err);
          }
          if (stat && stat.isDirectory()) {
            try {
              const res = await dirWalk(file);
              results = results.concat(res);
            } catch (errStat) {
              return reject(errStat);
            }
            return next();
          }
          results.push(file);
          return next();
        });
      }
    });
  });
}
