import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

const MODEL_NAME = 'Template';

const Schema = new mongoose.Schema({
  title: String,
  description: String,

  variables: {
    headersFont: String,
    mainFont: String,
    fontSizeBase: { type: Number, required: true, default: 16 },

    bodyColor: { type: String, required: true, default: '#000000' },
    bodyBgColor: { type: String, required: true, default: '#FFFFFF' },

    enableRounded: { type: Boolean, required: true, default: true },
    enableGradients: { type: Boolean, required: true, default: false }
  },

  cssContent: String,

  imagePreview: mongoose.Schema.Types.Buffer,

  oldId: Number,
  removed: Date
}, {
  collection: 'cms.templates'
});

Schema.plugin(timestamp);

export default mongoose.model(MODEL_NAME, Schema);
