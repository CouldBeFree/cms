import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Infolist', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { type: Sequelize.STRING },
  category: { type: Sequelize.INTEGER },
  company: { type: Sequelize.INTEGER },
  is_stream: { type: Sequelize.INTEGER },
  title: { type: Sequelize.STRING }
}, {
  tableName: 'infolists'
});
