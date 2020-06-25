import mongoose from 'mongoose';
import multitenancy from 'mongoose-multitenancy';
import Sequelize from 'sequelize';
import { env } from '../lib/env';

export default function connect(connectionString) {
  multitenancy.setup();

  return mongoose.connect(connectionString, { useNewUrlParser: true });
}

let db = new Sequelize({
  dialect: env.DB_TYPE,
  // logging: false,
  define: { timestamps: false },
  pool: {
    min: 0,
    max: 5,
    idle: 20000,
    acquire: 20000
  },

  port: +env.DB_PORT,
  host: env.DB_HOSTNAME,
  username: env.DB_USERNAME,
  password: '' + env.DB_PASSWORD,
  database: env.DB_DATABASE,

  timezone: '+00:00'
});

export { db };

export async function initConnection() {
  await db.authenticate();
}
