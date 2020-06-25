import path from 'path';
import GridFS from 'gridfs-stream';
import mongoose from 'mongoose';
import File from '../models/File';

const ROOT_COLLECTION = 'cms';

export default
class FileRepo {
  static async setMetadata (fileId, metadata = {}) {
    const file = await File.findOne(fileId);
    file.metadata = metadata;
    await file.save();
  }

  static saveFileFromStream (fileStream, filename, mimeType = 'application/octet-stream') {
    const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

    const options = {
      _id: mongoose.Types.ObjectId(),
      filename: filename,
      mode: 'w',
      content_type: mimeType,
      root: ROOT_COLLECTION,
      metadata: {}
    };

    return new Promise((resolve, reject) => {
      const writeStream = gfs.createWriteStream(options);
      writeStream.on('error', reject);
      fileStream.on('error', reject);

      fileStream.pipe(writeStream);
      return writeStream.on('close', onStreamEnd);

      function onStreamEnd () {
        resolve(options);
      }
    });
  }
}

export function pipe (from, to, options) {
  return new Promise((resolve, reject) => {
    from.pipe(to, options);
    from.on('error', reject);
    from.on('end', resolve);
  });
}

export async function getFileStream (fileId, root = null) {
  const gfs = GridFS(mongoose.connection.db, mongoose.mongo);

  if (!await gfs.exist({ root: root || ROOT_COLLECTION, _id: fileId })) {
    return null;
  }
  return gfs.createReadStream({ root: root || ROOT_COLLECTION, _id: fileId });
}

export function getMimetype (filename) {
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

export async function isFileExists (file) {
  const gfs = GridFS(mongoose.connection.db, mongoose.mongo);
  file.root = ROOT_COLLECTION;

  return new Promise((resolve, reject) => {
    gfs.exist(file, (err, exists) => {
      if (err) {
        return reject(err);
      }
      resolve(exists);
    });
  });
}

export async function getFile (file) {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.collection(ROOT_COLLECTION + '.files').findOne({ _id: new mongoose.Types.ObjectId(file._id) }, (err, file) => {
      if (err) {
        return reject(err);
      }
      resolve(file);
    });
  });
}
