import path from 'path';
import GridFS from 'gridfs-stream';
import mongoose from 'mongoose';

import Template from '../models/Template';
import Block from '../models/Block';

const ROOT_COLLECTION = 'cms';

export default
class PageRepo {
  static async loadDetailsForResponse (page) {
    const data = page.toObject();

    const blocksIds = (data.blocks || []).map(item => item._id);
    const blocks = await Block.find({ _id: { $in: blocksIds } });

    data.blocks = blocks;

    return data;
  }
}
