import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('Product', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
    allowNull: false
  },
  import: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap,
  },
  ext_id: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  time: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap
    allowNull: false
  },
  last_edit: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap
  },
  infolist: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap
    allowNull: false
  },
  key1: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key2: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key3: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key4: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key5: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key6: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key7: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key8: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key9: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
  key10: {
    type: Sequelize.STRING(255), // eslint-disable-line new-cap
  },
}, {
  timestamps: false,
  freezeTableName: true,
  tableName: 'products',
  defaultScope: {
    where: {
      // isActive: true
    }
  },

  classMethods: {
  },
  instanceMethods: {
    toJSON: function () { // eslint-disable-line object-shorthand
      return this.dataValues;
    }
  }
});
