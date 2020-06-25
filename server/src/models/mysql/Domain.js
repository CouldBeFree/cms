import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Domain', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url: { type: Sequelize.STRING },
  index_page: { type: Sequelize.STRING },
  error_page: { type: Sequelize.STRING },
  company: { type: Sequelize.STRING },
  skin: { type: Sequelize.STRING },
  html_head_code: { type: Sequelize.STRING },
}, {
  tableName: 'domains'
});
