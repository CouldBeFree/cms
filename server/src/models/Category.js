import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

import { AttributesGroupEmbedSchema } from './AttributesGroup';
import { DataOwnerEmbedSchema } from './DataOwner';
import { ALL_ATTRIBUTE_TYPES } from '../shared/dataTypes';

export const STATUS_NEW = 'new';
export const STATUS_DOWNLOAD = 'download';
export const STATUS_INPROCESS = 'inprocess';
export const STATUS_ERROR = 'error';
export const STATUS_DONE = 'done';

export const ALL_STATUSES = [
    STATUS_NEW,
    STATUS_DOWNLOAD,
    STATUS_INPROCESS,
    STATUS_ERROR,
    STATUS_DONE
];

export const EXECUTION_MANUAL = 'manual';
export const EXECUTION_AUTO = 'auto';

const CategorySchema = new Schema({
    owner: DataOwnerEmbedSchema,

    title: { type: String, required: true },

    categoryType: { type: String, required: true, default: 'simple', enum: ['smart-list', 'simple'] },

    attributeGroups: [AttributesGroupEmbedSchema],

    importSettings: {
        enabled: Boolean,
        enabledAutoImport: Boolean,
        period: Number,
        importUrl: String,

        exampleContent: Schema.Types.Mixed,
        columns: {
            type: Schema.Types.Mixed,
            required: true
        },

        executionType: {
            type: String,
            default: EXECUTION_MANUAL,
            enum: [
                EXECUTION_MANUAL,
                EXECUTION_AUTO
            ]
        },

        currentStatus: {
            text: String,
            perc: Number,
            state: {
                type: String,
                default: STATUS_NEW,
                enum: ALL_STATUSES
            }
        }
    },

    // required by ResourceService
    removed: Date,

    // for migration
    oldId: Number,
    isStream: Number
}, {
    strict: true,
    safe: true,
    collection: 'data.categories'
});

CategorySchema.plugin(timestamp);

const CategoryEmbedSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    title: String
});

export { CategoryEmbedSchema };

export default mongoose.model('Category', CategorySchema);
