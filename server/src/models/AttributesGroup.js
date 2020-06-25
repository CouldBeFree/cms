import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

import { DataOwnerEmbedSchema } from './DataOwner';

const AttributesGroupSchema = new Schema({
    owner: DataOwnerEmbedSchema,

    title: { type: String, required: true },

    attributes: [{
        _id: { type: Schema.Types.ObjectId, required: true },
        title: String
    }],

    // required by ResourceService
    removed: Date,

    // for migration
    oldId: Number
}, {
    strict: true,
    safe: true,
    collection: 'data.attributesGroups'
});

AttributesGroupSchema.plugin(timestamp);

const AttributesGroupEmbedSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    title: String
});

export { AttributesGroupEmbedSchema };

export default mongoose.model('AttributesGroup', AttributesGroupSchema);
