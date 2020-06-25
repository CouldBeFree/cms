import mongoose from 'mongoose';
import materialized from 'mongoose-materialized';
import timestamp from 'mongoose-timestamp-plugin';
import { DataOwnerEmbedSchema } from './DataOwner';

const MODEL_NAME = 'Folder';

const Schema = new mongoose.Schema({
  owner: DataOwnerEmbedSchema,

  title: String,

  removed: Date,

  // for migration
  oldId: Number
}, {
  collection: 'cms.folders'
});

Schema.plugin(timestamp);
Schema.plugin(materialized);

export default mongoose.model(MODEL_NAME, Schema);
