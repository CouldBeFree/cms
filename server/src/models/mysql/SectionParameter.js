import Sequelize from 'sequelize';

import { db } from '../../lib/db';

export default db.define('SectionParameter', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  section: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  value: { type: Sequelize.STRING }
}, {
  tableName: 'section_parameters'
});
