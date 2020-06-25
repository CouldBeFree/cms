import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { csvMiddleware, fileUploader } from '../middleware/file-uploader';
import { getFile } from '../lib/files';

import Category from '../models/Category';
import ImportJob from '../models/ImportJob';
import AttributesGroup from '../models/AttributesGroup';
import TasksService from "../services/TasksService";
import { paginationMiddleware } from "../middleware/pagination";
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/import-jobs', jwtAuth())
export default class ImportsCtrl {
  @get('', paginationMiddleware({
    query: ['title'],
    sorting: {
      default: { createdAt: -1 }
    }
  }))
  async getItems (ctx) {
    const params = {
      'owner._id': ctx.state.owner._id,
      removed: { $exists: false }
    };

    if (ctx.pagination.query) {
      params.$or = ctx.pagination.query;
    }

    try {
      const [items, count] = await Promise.all([
        ctx.pagination.apply(ImportJob.find(params, { imagePreview: 0, source: 0, compiled: 0 }).lean()),
        ImportJob.countDocuments(params)
      ]);
      ctx.set('x-total-count', count);
      ctx.ok(items);
    } catch (err) {
      ctx.status = 500;
      ctx.ok({ message: err.message });
    }
  }

  @del('/:_id')
  async deleteJob (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await ImportJob.findOne({ 'owner._id': ctx.state.owner._id, _id, removed: { $exists: false } });

      if (!item) {
        return ctx.notFound({ message: 'Job not found' });
      }
      await ImportJob.update(
        { 'owner._id': ctx.state.owner._id, _id },
        { $set: { removed: Date.now() } }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
