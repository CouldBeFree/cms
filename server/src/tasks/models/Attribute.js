import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Attribute', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: { type: Sequelize.INTEGER },
  name: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  suffix: { type: Sequelize.STRING },
  type: { type: Sequelize.STRING },
  format: { type: Sequelize.STRING }
}, {
  tableName: 'attributes'
});
