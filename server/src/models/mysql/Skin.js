import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Skin', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: { type: Sequelize.STRING },
  variables: { type: Sequelize.STRING },
  style: { type: Sequelize.STRING },
  settings: { type: Sequelize.STRING }
}, {
  tableName: 'skins'
});
