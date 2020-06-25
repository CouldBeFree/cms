import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Template from '../models/Template';
import Block from "../models/Block";

export default
@controller('/api/v1/templates')
class TemplatesCtrl {
  @get('', paginationMiddleware({
    query: ['title'],
    sorting: {
      default: { createDate: -1 }
    }
  }))
  async getItems (ctx) {
    const params = {
      removed: { $exists: false }
    };

    if (ctx.pagination.query) {
      params.$or = ctx.pagination.query;
    }

    try {
      const [items, count] = await Promise.all([
        ctx.pagination.apply(Template.find(params, { imagePreview: 0, source: 0, compiled: 0 }).lean()),
        Template.countDocuments(params)
      ]);
      ctx.set('x-total-count', count);
      ctx.ok(items);
    } catch (err) {
      ctx.status = 500;
      ctx.ok({ message: err.message });
    }
  }

  @post('')
  async createItem (ctx) {
    try {
      const { title } = ctx.request.body;

      const existItem = await Template.findOne({ $or: [{ title }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Template with this title already exists' });
      }

      const item = new Template(ctx.request.body);

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

      const item = await Template.findOne({ _id: ctx.params._id });
      if (!item) {
        return ctx.badRequest({ message: 'Template not found' });
      }
      const existItem = await Template.findOne({ $or: [{ title, _id: { $ne: ctx.params._id } }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Template with this title already exists' });
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
    const item = await Template.findOne({ _id: ctx.params._id }, { imagePreview: 0 }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Template not found' });
    }
    ctx.ok(item);
  }

  @del('/:_id')
  async deleteTemplate (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await Template.findOne({ _id, removed: { $exists: false } })
        .lean();

      if (!item) {
        return ctx.notFound({ message: 'Template not found' });
      }
      await Template.findOneAndUpdate(
        { _id },
        { $set: { removed: Date.now() } }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @del('/')
  async deleteTemplates (ctx) {
    const { ids } = ctx.request.body;
    try {
      let items = await Template.find({ _id: { $in: ids }, removed: { $exists: false } }, { _id: 1 })
        .lean();

      let result = {
        success: [],
        failed: []
      };

      for (let item of items) {
        await Template.findOneAndUpdate(
          { _id: item._id },
          { $set: { removed: Date.now() } },
        );
        result.success.push(item._id);
      }
      ctx.ok(result);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
