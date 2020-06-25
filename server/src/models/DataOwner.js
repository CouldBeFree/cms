import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';

const DataOwnerSchema = new Schema({
    removed: Date, // required by ResourceService,

    // for migration
    oldId: Number,
    companyName: String
}, {
    strict: true,
    safe: true,
    collection: 'data.owners'
});

DataOwnerSchema.plugin(timestamp);

const DataOwnerEmbedSchema = {
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        $tenant:true
    },
    title: String
};

export { DataOwnerEmbedSchema };

export default mongoose.model('DataOwner', DataOwnerSchema);
