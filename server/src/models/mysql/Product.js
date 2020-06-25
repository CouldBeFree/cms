import Sequelize from 'sequelize';

import { db } from '../../lib/db';

const model = db.define('Product', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { type: Sequelize.STRING }
}, {
  tableName: 'products'
});

export default model;
