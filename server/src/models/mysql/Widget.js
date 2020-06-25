import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Widget', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { type: Sequelize.STRING },
  domain: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  image_link: { type: Sequelize.STRING },
  text: { type: Sequelize.STRING },
  template: { type: Sequelize.STRING },
  button_caption: { type: Sequelize.STRING },
}, {
  tableName: 'widgets'
});
