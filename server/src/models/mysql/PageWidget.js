import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('PageWidget', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  page: { type: Sequelize.STRING },
  widget: { type: Sequelize.STRING },
  placement: { type: Sequelize.STRING },
  sequence: { type: Sequelize.STRING }
}, {
  tableName: 'pages_widgets'
});
