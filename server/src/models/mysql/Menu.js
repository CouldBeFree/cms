import Sequelize from 'sequelize';

import { db } from '../../lib/db';

const model = db.define('Menu', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  domain: { type: Sequelize.STRING },
  sequence: { type: Sequelize.STRING },
  link: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  parent: { type: Sequelize.STRING },
  menu_group: { type: Sequelize.STRING }
}, {
  tableName: 'menus'
});

export default model;
