import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Company', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: { type: Sequelize.STRING },
  first_name: { type: Sequelize.STRING },
  last_name: { type: Sequelize.STRING },
  user_name: { type: Sequelize.STRING },
  user_type: { type: Sequelize.STRING },
}, {
  tableName: 'users'
});
