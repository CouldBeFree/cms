import fs from 'fs';
import moment from 'moment';
import { controller, get, put, post, del } from 'koa-dec-router';
import sharp from 'sharp'
import { jwtAuth } from '../middleware/auth';
// import { getFileStream } from '../helpers/file-uploader';
import File from '../models/File';

@controller('/api/v1/preview')
export default class PhotosCtrl {
  @get('/:_id')
  @get('/:_id/:size')
  async getThumbnail(ctx) {
    const { _id, size } = ctx.params;
    let sourceStream = fs.createReadStream(`uploads/${_id}`);
      //await getFileStream(_id);

    if (!sourceStream) {
      return ctx.notFound('Not found');
    }

    if (size) {
      let [width, height] = size.split('x');
      if (width !== '') {
        width = parseInt(width);
      } else {
        width = null;
      }
      if (height !== '') {
        height = parseInt(height);
      } else {
        height = null
      }
      const transformer = sharp()
        .resize(width, height)
        // .embed()
        // .background({r: 255, g: 0, b: 0, alpha: 0})
        //.crop(sharp.strategy.center)
        .on('error', function(err) {
          ctx.badRequest({ error: err.message });
        });

      sourceStream = sourceStream.pipe(transformer);
    }
    ctx.body = sourceStream;
  }
}
