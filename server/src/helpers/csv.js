import iconv from 'iconv-lite';
import csv from 'csvtojson';
import AutoDetectDecoderStream from 'autodetect-decoder-stream';

export
async function parseCSVStream(readStream) {
    const items = [];

    await parseCSVStreamItem(readStream, async (item) => {
        items.push(item);
    });
    return items;
}

export
function parseCSVStreamItem(readStream, onItemCallback) {
    return new Promise((resolve, reject) => {
        csv({ noheader: true, trim: true, delimiter: 'auto', output: 'csv' })
            .fromStream(readStream
                    .pipe(new AutoDetectDecoderStream({ defaultEncoding: 'iso-8859-2' }))
                // .pipe(iconv.decodeStream('iso-8859-2'))
                // .pipe(iconv.encodeStream('utf-8'))
            )
            .subscribe(async (json) => await onItemCallback(json), reject, resolve);
    });
}