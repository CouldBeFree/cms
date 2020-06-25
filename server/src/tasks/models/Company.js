import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Company', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
}, {
  tableName: 'company'
});
