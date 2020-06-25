import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

import { DataOwnerEmbedSchema } from './DataOwner';
import { CategoryEmbedSchema, STATUS_NEW, ALL_STATUSES } from './Category';

const DataFileSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  filename: String,
  length: Number
});

const ImportJobSchema = new Schema({
  owner: DataOwnerEmbedSchema,
  category: CategoryEmbedSchema,

  files: [DataFileSchema],

  createdCount: Number,
  updatedCount: Number,

  currentStatus: {
    text: String,
    perc: Number,
    state: {
      type: String,
      required: true,
      default: STATUS_NEW,
      enum: ALL_STATUSES
    }
  },

  // required by ResourceService
  removed: Date
}, {
  strict: true,
  safe: true,
  collection: 'data.importJobs'
});

ImportJobSchema.plugin(timestamp);

const DataImportJobEmbedSchema = new Schema({});

export { DataImportJobEmbedSchema };

export default mongoose.model('ImportJob', ImportJobSchema);
