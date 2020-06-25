import mongoose from 'mongoose';
import GridFS from 'gridfs-stream';

const ROOT_COLLECTION = 'cms';

export function pipe(from, to, options) {
    return new Promise((resolve, reject) => {
        from.pipe(to, options);
        from.on('error', reject);
        from.on('end', resolve);
    });
}

export async function getFileStream(fileId, root = null) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

    if (!await gfs.exist({root: root || ROOT_COLLECTION, _id: fileId})) {
        return null;
    }
    return gfs.createReadStream({root: root || ROOT_COLLECTION, _id: fileId});
}

export async function getFileItem(fileId, root = null) {
    return new Promise((resolve, reject) => {
        mongoose.connection.db.collection((root || ROOT_COLLECTION) + '.files').findOne({_id: new mongoose.Types.ObjectId(fileId)}, (err, file) => {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
}
