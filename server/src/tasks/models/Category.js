import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Category', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  father: { type: Sequelize.INTEGER },
  company: { type: Sequelize.INTEGER },
  name: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING }
}, {
  tableName: 'categories'
});
