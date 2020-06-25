import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('MediaFile', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company: {
    type: Sequelize.INTEGER
  },
  filesize: {
    type: Sequelize.INTEGER
  },
  width: {
    type: Sequelize.INTEGER
  },
  height: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    unique: true,
    allowNull: false
  },
  mime: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    allowNull: false
  },
  type: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    allowNull: false
  },
  modified: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    allowNull: false
  }
}, {
  tableName: 'media_files'
});
