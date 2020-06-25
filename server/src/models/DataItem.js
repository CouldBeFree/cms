import mongoose, { Schema } from 'mongoose';
import multitenancy from 'mongoose-multitenancy';
import timestamp from 'mongoose-timestamp-plugin';

import { CategoryEmbedSchema } from './Category';
import { DataOwnerEmbedSchema } from './DataOwner';
import { ALL_ATTRIBUTE_TYPES } from '../shared/dataTypes';
// import { DataImageSchema } from './File';

multitenancy.setup();

const ModelSchema = new Schema({
    owner: DataOwnerEmbedSchema,

    sku: { type: String, required: true },
    title: { type: String, required: true },

    category: CategoryEmbedSchema,

    images: [{ _id: mongoose.Schema.Types.ObjectId }],
    attributes: [{
        _id: {
            type: Schema.Types.ObjectId,
            required: true
        },

        isIgnored: { type: Boolean, required: true },
        value: Schema.Types.Mixed,
        numValue: Number
    }],

    // required by ResourceService
    removed: Date,

    // for migration
    oldId: Number
}, {
    strict: true,
    safe: true,
    collection: 'data.items'
});

ModelSchema.plugin(timestamp);

export default mongoose.mtModel('DataItem', ModelSchema);
