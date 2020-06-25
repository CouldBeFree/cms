import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

const MODEL_NAME = 'Page';

const schema = new mongoose.Schema({
  name: String,
  title: String, // H1
  slug: String,

  metaTitle: String,
  metaDescription: String,

  pageLayout: String,

  noindex: Boolean,
  hideH1: Boolean,

  headScript: String,

  blocks: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      placement: String,
      sequence: String,
      parameters: Schema.Types.Mixed,
      blockId: String
    }
  ],

  oldId: Number,
  removed: Date
}, {
  collection: 'cms.pages'
});

schema.plugin(timestamp);

export default mongoose.model(MODEL_NAME, schema);
