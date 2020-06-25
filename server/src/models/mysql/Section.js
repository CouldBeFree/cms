import Sequelize from 'sequelize';
import SectionParameter from './SectionParameter';

import { db } from '../../lib/db';

const model = db.define('Section', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  page: { type: Sequelize.STRING },
  image_link: { type: Sequelize.STRING },
  text: { type: Sequelize.STRING },
  html: { type: Sequelize.STRING },
  template: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  descr: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  sequence: { type: Sequelize.STRING },
  button_caption: { type: Sequelize.STRING },
}, {
  tableName: 'sections'
});

model.hasMany(SectionParameter, { foreignKey: 'section' });

export default model;
