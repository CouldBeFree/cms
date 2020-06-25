import parse from 'co-busboy';
import path from 'path';
import GridFS from 'gridfs-stream';
import mongoose from 'mongoose';
import imageSize from 'image-size';

const ROOT_COLLECTION = 'cms';

export function pipe(from, to, options) {
    return new Promise((resolve, reject) => {
        from.pipe(to, options);
        from.on('error', reject);
        from.on('end', resolve);
    });
}

export function getMimetype(filename) {
    switch (path.extname(filename)) {
        case '.jpeg':
        case '.jpg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
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

export function saveFileFromStream(fileStream, filename, mimeType) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

    let buffer = Buffer.from([]);
    let length = 0;
    const options = {
        root: ROOT_COLLECTION,
        _id: mongoose.Types.ObjectId(),
        filename: filename,
        mode: 'w',
        content_type: mimeType,
        metadata: {
            dimensions: null
        }
    };

    return new Promise((resolve, reject) => {
        const writeStream = gfs.createWriteStream(options);
        writeStream.on('error', reject);

        fileStream.on('data', onStreamData);
        fileStream.on('error', reject);

        fileStream.pipe(writeStream);

        return writeStream.on('close', onStreamEnd);

        function onStreamEnd() {
            resolve(options);
        }
    });

    function onStreamData(data) {
        if (options.metadata.dimensions) {
            return;
        }
        length += data.length;
        buffer = Buffer.concat([buffer, data], length);
        try {
            options.metadata.dimensions = imageSize(buffer);
        } catch (e) {
            console.log('e', e);
        }
    }
}

export async function fileUploader(ctx, next) {
    if (ctx.req.method !== 'POST') {
        return next();
    }
    const parts = parse(ctx);
    const files = [];

    let part;
    while ((part = await parts())) {
        if (!part.length) {
            let file = await saveFileFromStream(part, part.filename, part.mimeType);
            files.push(file);
        }
    }

    return files;
}
