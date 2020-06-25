import Sequelize from 'sequelize';
import Widget from './Widget';
import Section from './Section';
import PageWidget from './PageWidget';

import { db } from '../../lib/db';

const model = db.define('Page', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  redirect: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  domain: { type: Sequelize.STRING },
  permalink: { type: Sequelize.STRING },
  meta_title: { type: Sequelize.STRING },
  descr: { type: Sequelize.STRING },
  notes: { type: Sequelize.STRING },
  template: { type: Sequelize.STRING },
  noindex: { type: Sequelize.STRING },
  hide_h1: { type: Sequelize.STRING },
  scripts: { type: Sequelize.STRING },
  headscript: { type: Sequelize.STRING },
}, {
  tableName: 'pages'
});

model.belongsToMany(Widget, { through: PageWidget, foreignKey: 'page', otherKey: 'widget' });
model.hasMany(Section, { foreignKey: 'page' });

export default model;
