import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

import { AttributesGroupEmbedSchema } from './AttributesGroup';
import { ALL_ATTRIBUTE_TYPES } from '../shared/dataTypes';
import { DataOwnerEmbedSchema } from './DataOwner';

const AttributeSchema = new Schema({
    owner: DataOwnerEmbedSchema,

    title: { type: String, required: true },
    label: { type: String },
    defaultValue: Schema.Types.Mixed,
    suffix: String,

    dataType: {
        type: String,
        required: true,
        enum: ALL_ATTRIBUTE_TYPES.map(item => item.key)
    },

    attributeGroup: AttributesGroupEmbedSchema,

    // required by ResourceService
    removed: Date,

    // for migration
    oldId: Number
}, {
    strict: true,
    safe: true,
    collection: 'data.attributes'
});

AttributeSchema.plugin(timestamp);

export default mongoose.model('Attribute', AttributeSchema);
