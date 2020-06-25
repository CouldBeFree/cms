import path from 'path';
import GridFS from 'gridfs-stream';
import mongoose from 'mongoose';
import unzip from 'unzip-stream';
import csv from 'csvtojson';

const DATA_IMPORT_COLLECTION = 'cms';

export function pipe(from, to, options) {
    return new Promise((resolve, reject) => {
        from.pipe(to, options);
        from.on('error', reject);
        from.on('end', resolve);
    })
}

export async function getFileStream(fileId, root = null) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

    if (!await gfs.exist({root: root || ROOT_COLLECTION, _id: fileId})) {
        return null;
    }
    return gfs.createReadStream({root: root || ROOT_COLLECTION, _id: fileId});
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

export function saveFileFromStream(fileStream, filename, mimeType = 'application/octet-stream') {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

    const options = {
        _id: mongoose.Types.ObjectId(),
        filename: filename,
        mode: 'w',
        content_type: mimeType,
        root: DATA_IMPORT_COLLECTION,
        metadata: {}
    };

    return new Promise((resolve, reject) => {
        const writeStream = gfs.createWriteStream(options);
        writeStream.on('error', reject);
        fileStream.on('error', reject);

        fileStream.pipe(writeStream);
        return writeStream.on('close', onStreamEnd);

        function onStreamEnd() {
            resolve(options);
        }
    });
}

export async function isFileExists(file) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);
    file.root = DATA_IMPORT_COLLECTION;

    return new Promise((resolve, reject) => {
        gfs.exist(file, (err, exists) => {
            if (err) {
                return reject(err);
            }
            resolve(exists);
        });
    })
}

export async function getFile(file) {
    return new Promise((resolve, reject) => {
        mongoose.connection.db.collection(DATA_IMPORT_COLLECTION + '.files').findOne({_id: new mongoose.Types.ObjectId(file._id)}, (err, file) => {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
}

export async function unzipFileInDb(file) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);
    file.root = DATA_IMPORT_COLLECTION;
    const readStream = gfs.createReadStream(file);
    return await saveUnziped(readStream);
}

export function unzipAndSaveFileFromStream(readStream, filename) {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);
    return new Promise(async (resolve, reject) => {
        try {
            const promise = saveUnziped(readStream);

            const file = await saveFileFromStream(readStream, filename);
            const files = await promise;
            await gfs.remove(file);
            console.info('unzipAndSaveFileFromStream done')
            return resolve(files);
        } catch (err) {
            console.info('unzipAndSaveFileFromStream', err);
            resolve([file]);
        }
    });
}

function saveUnziped(readStream) {
    return new Promise(async (resolve, reject) => {
        const files = [];

        try {
            return readStream
                .pipe(unzip.Parse())
                .on('entry', async (entry) => {
                    if (entry.type !== 'Directory') {
                        const file = saveFileFromStream(entry, entry.path);
                        files.push(file);
                    } else {
                        entry.autodrain();
                    }
                })
                .on('error', reject)
                .on('end', onStreamEnd);
        } catch (err) {
            console.info('unzip', err);
        }

        async function onStreamEnd() {
            resolve(await Promise.all(files));
        }
    });
}

export function parseCSVFile(file, headers, options, onItemFound) {
    return new Promise(async (resolve, reject) => {
        const gfs = GridFS(mongoose.connection.db, mongoose.mongo);
        const readStream = gfs.createReadStream(file);
        const promises = [];

        csv({
            noheader: true,
            trim: true,
            headers,

            ...options
        })
            .fromStream(readStream)
            .on('json', async (json) => {
                try {
                    promises.push(onItemFound(json));
                } catch (err) {
                    reject(err);
                    readStream.destroy();
                }
            })
            .on('done', async () => {
                await Promise.all(promises);
                resolve();
            })
    });
}
