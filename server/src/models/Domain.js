import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

const MODEL_NAME = 'Domain';

const Schema = new mongoose.Schema({
  name: String,

  template: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

  indexPage: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  errorPage: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

  logo: mongoose.Schema.Types.Mixed,

  htmlHeadCode: String,

  oldId: Number,
  removed: Date
}, {
  collection: 'cms.domains'
});

Schema.plugin(timestamp);

export default mongoose.model(MODEL_NAME, Schema);
