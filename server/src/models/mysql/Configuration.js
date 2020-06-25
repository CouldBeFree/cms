import Sequelize from 'sequelize';

import { db } from '../../lib/db';

const model = db.define('Configuration', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { type: Sequelize.STRING },
  company: { type: Sequelize.STRING },
  configuration: { type: Sequelize.STRING },
  type: { type: Sequelize.STRING }
}, {
  tableName: 'configurations'
});

export default model;
