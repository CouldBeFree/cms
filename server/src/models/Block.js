import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';
import autoIncrement from 'mongoose-auto-increment';

const MODEL_NAME = 'Block';

const Schema = new mongoose.Schema({
  title: String,
  description: String,

  css: {
    source: String,
    type: { type: String, default: 'css' },
    files: [],
    compiled: String
  },
  html: {
    source: String,
    type: { type: String, default: 'html' },
    files: [],
    compiled: String
  },
  js: {
    source: String,
    type: { type: String, default: 'js' },
    files: [],
    compiled: String
  },

  attributes: [
    {
      title: { type: String },
      label: { type: String },
      dataType: { type: String },
      defaultValue: { type: mongoose.Schema.Types.Mixed }
    }
  ],

  pans: [String],

  imagePreview: mongoose.Schema.Types.Buffer,

  oldId: Number,
  removed: Date
}, {
  collection: 'cms.blocks'
});

Schema.plugin(timestamp);
autoIncrement.initialize(mongoose);
Schema.plugin(autoIncrement.plugin, { model: MODEL_NAME, field: 'blockId' });

export default mongoose.model(MODEL_NAME, Schema);
