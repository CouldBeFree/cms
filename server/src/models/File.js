import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';
import { DataOwnerEmbedSchema } from "./DataOwner";

const MODEL_NAME = 'File';

const Schema = new mongoose.Schema({
  filename: String,
  contentType: String,

  metadata: {
    oldId: Number,
    owner: { _id: mongoose.Schema.Types.ObjectId },
    folderId: mongoose.Schema.Types.ObjectId
  },

  removed: Date
}, {
  collection: 'cms.files'
});

Schema.plugin(timestamp);

export default mongoose.model(MODEL_NAME, Schema);
