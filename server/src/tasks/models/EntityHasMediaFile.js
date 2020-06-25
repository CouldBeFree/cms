import Sequelize from 'sequelize';

import { db } from '../../lib/db';
import MediaFile from './MediaFile';

const model = db.define('EntityHasMediaFile', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  media_file: {
    type: Sequelize.INTEGER
  },
  entity: {
    type: Sequelize.INTEGER
  },
  ord: {
    type: Sequelize.INTEGER
  },
  entity_type: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    unique: true,
    allowNull: false
  },
  attachment_type: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    allowNull: false
  }
}, {
  tableName: 'entity_has_media_files'
});

model.belongsTo(MediaFile, {
  foreignKey: 'media_file'
});

export default model;
