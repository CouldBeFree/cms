import parse from 'co-busboy';
import FileRepo from '../repositories/FileRepo';
import unzip from 'unzip-stream';
import csv from "csvtojson";
import iconv from "iconv-lite";
import { parseCSVStream } from '../helpers/csv';

export async function fileUploader (ctx, next) {
  if (ctx.method !== 'POST') {
    return next();
  }
  const parts = parse(ctx);
  const files = [];

  let part;
  let body = {};
  try {
    while ((part = await parts())) {
      if (!part.length) {
        files.push(await FileRepo.saveFileFromStream(part, part.filename, part.mimeType));
      } else {
        let [name, value] = part;
        body[name] = value;
      }
    }
  } catch (err) {
    return next(err);
  }
  ctx.files = files;
  ctx.request.body = body;
  next();
}

export async function csvMiddleware(ctx, next) {
  if (ctx.method !== 'POST') {
    return next();
  }
  const parts = parse(ctx);
  let files = [];

  let part;
  while (part = await parts()) {
    if (!part.length) {
      files = files.concat(await parseStream(part));
    }
  }
  ctx.files = files;
  return next();

  async function parseStream(readStream) {
    if (readStream.mimeType === 'application/zip' || readStream.mimeType === 'application/x-zip-compressed') {
      return new Promise((resolve, reject) => {
        const files = [];
        readStream
          .pipe(unzip.Parse())
          .on('entry', (entry) => {
            if (entry.type !== 'Directory' && entry.path.match(/.csv$/i)) {
              const file = parseCSVStream(entry);
              files.push(file);
            } else {
              entry.autodrain();
            }
          })
          .on('error', reject)
          .on('end', onStreamEnd);

        async function onStreamEnd() {
          resolve(await Promise.all(files));
        }
      });
    }
    if (readStream.mimeType === 'text/csv') {
      return [await parseCSVStream(readStream)];
    }
    throw new Error('Invalid file mimetype')
  }
}
