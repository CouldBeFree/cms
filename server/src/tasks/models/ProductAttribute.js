import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('ProductAttribute', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap
    allowNull: false
  },
  attribute: {
    type: Sequelize.INTEGER, // eslint-disable-line new-cap
    allowNull: false
  },
  value: {
    type: Sequelize.TEXT, // eslint-disable-line new-cap
  }
}, {
  timestamps: false,
  freezeTableName: true,
  tableName: 'product_attributes',
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
