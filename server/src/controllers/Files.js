import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import File from '../models/File';
import Folder from '../models/Folder';
import FolderRepo from '../repositories/FolderRepo';
import FileRepo from '../repositories/FileRepo';
import { fileUploader } from '../middleware/file-uploader';
import { jwtAuth } from "../middleware/auth";

export default
@controller('/api/v1/files', jwtAuth())
class FilesCtrl {
  @get('', paginationMiddleware({
    query: ['filename'],
    sorting: {
      default: { createDate: -1 }
    }
  }))
  async getItems (ctx) {
    const { folderId } = ctx.request.query;
    const params = {
      'metadata.owner._id': ctx.state.owner._id,
      'metadata.folderId': folderId,
      removed: { $exists: false }
    };

    if (ctx.pagination.query) {
      params.$or = ctx.pagination.query;
    }

    try {
      const [items, count] = await Promise.all([
        ctx.pagination.apply(File.find(params, { blocks: 0 }).lean()),
        File.countDocuments(params)
      ]);
      ctx.set('x-total-count', count);
      ctx.ok(items);
    } catch (err) {
      ctx.status = 500;
      ctx.ok({ message: err.message });
    }
  }

  @post('/upload', fileUploader)
  async uploadFile (ctx) {
    let { folderId } = ctx.request.body;

    if (!ctx.files || !ctx.files.length) {
      return ctx.badRequest({ message: 'No files' });
    }
    const file = ctx.files[0];

    ctx.ok({ _id: file._id });

    await FileRepo.setMetadata(file._id, { owner: ctx.state.owner, folderId });
  }

  @post('')
  async createItem (ctx) {
    try {
      let { title, parentId } = ctx.request.body;
      if (!parentId) {
        let root = await FolderRepo.getRoot();
        parentId = root._id;
      }

      const existItem = await FolderRepo.isExists(title, parentId);
      if (existItem) {
        return ctx.badRequest({ message: 'Folder with this title already exists' });
      }

      const item = new Folder(ctx.request.body);
      if (!item.parentId) {
        item.parentId = parentId;
      }
      await item.save();

      ctx.ok({ _id: item._id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @put('/:_id')
  async updateItem (ctx) {
    try {
      const { title } = ctx.request.body;

      const item = await Folder.findOne({ _id: ctx.params._id });
      if (!item) {
        return ctx.badRequest({ message: 'Folder not found' });
      }
      const existItem = await Folder.findOne({ $or: [{ title, _id: { $ne: ctx.params._id } }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Folder with this title already exists' });
      }

      _.assign(item, ctx.request.body);

      await item.save();

      ctx.noContent();
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @get('/:_id')
  async getItem (ctx) {
    const item = await Folder.findOne({ _id: ctx.params._id }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Page not found' });
    }
    ctx.ok(item);
  }

  @del('/:_id')
  async deleteAccount (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await Folder.findOne({ _id, removed: { $exists: false } });

      if (!item) {
        return ctx.notFound({ message: 'Folder not found' });
      }
      const childs = await item.getChildren();
      const ids = childs.map(i => i._id).concat(_id);

      await Folder.update(
        { _id: { $in: ids } },
        { $set: { removed: Date.now() } },
        { multi: true }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
