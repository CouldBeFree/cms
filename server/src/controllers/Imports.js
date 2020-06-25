import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { csvMiddleware, fileUploader } from '../middleware/file-uploader';
import { getFile } from '../lib/files';

import Category from '../models/Category';
import ImportJob from '../models/ImportJob';
import AttributesGroup from '../models/AttributesGroup';
import TasksService from "../services/TasksService";
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/imports', jwtAuth())
export default class ImportsCtrl {
  @post('/parse', csvMiddleware)
  async parseImportFile(ctx) {
    if (!ctx.files || !ctx.files.length) {
      return ctx.badRequest({ message: 'No files' });
    }
    const file = ctx.files[0];

    ctx.ok({ items: file.slice(0, 10) });
  }

  @post('/upload', fileUploader)
  async uploadFile(ctx) {
    if (!ctx.files || !ctx.files.length) {
      return ctx.badRequest({ message: 'No files' });
    }
    const file = ctx.files[0];

    ctx.ok({ _id: file._id });
  }

  @post('')
  async createImportJob(ctx) {
    try {
      const { category, file } = ctx.request.body;

      if (!category || !category._id) {
        return ctx.badRequest({ message: 'Category not found' })
      }
      const existCategory = await Category.findOne({ _id: category._id });
      if (!existCategory) {
        return ctx.badRequest({ message: 'Category not found' })
      }

      const item = new ImportJob({
        owner: ctx.state.owner,
        category: existCategory.toObject()
      });
      if (file) {
        const fileDb = await getFile(file);
        if (!fileDb) {
          return ctx.badRequest({ message: 'File not found' })
        }
        item.files = [fileDb];
      }
      await item.save();

      existCategory.importSettings.currentStatus = item.currentStatus;
      await existCategory.save();

      const tasks = new TasksService();
      await tasks.init();
      tasks.runTask('import.start', { _id: item._id });
      tasks.stop();

      ctx.ok({ _id: item._id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
