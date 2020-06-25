import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Template from "../models/Template";
import { DomainRepository } from "../repositories/Domain";

export default
@controller('/api/v1/domains')
class DomainsCtrl {
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
        ctx.pagination.apply(Domain.find(params, { imagePreview: 0, source: 0, compiled: 0 }).lean()),
        Domain.countDocuments(params)
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
      const { name } = ctx.request.body;

      const existItem = await Domain.findOne({ $or: [{ name }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Domain with this name already exists' });
      }

      const item = new Domain(ctx.request.body);

      await item.save();

      ctx.ok({ _id: item._id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @post('/find')
  async findItem (ctx) {
    try {
      const { name } = ctx.request.body;

      const existItem = await DomainRepository.getDomainByHostname(name);
      if (!existItem) {
        return ctx.badRequest({ message: `Domain ${name} not found` });
      }
      existItem.template = await Template.findById(existItem.template._id, { _id: 1, title: 1, updatedAt: 1 });

      ctx.ok(existItem);
    } catch (err) {
      console.info(err.message);
      ctx.badRequest({ message: err.message });
    }
  }

  @put('/:_id')
  async updateItem (ctx) {
    try {
      const { title } = ctx.request.body;

      const item = await Domain.findOne({ _id: ctx.params._id });
      if (!item) {
        return ctx.badRequest({ message: 'Domain not found' });
      }
      const existItem = await Domain.findOne({ $or: [{ title, _id: { $ne: ctx.params._id } }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Domain with this title already exists' });
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
    const item = await Domain.findOne({ _id: ctx.params._id }, { imagePreview: 0 }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Domain not found' });
    }
    ctx.ok(item);
  }

  @del('/:_id')
  async deleteDomain (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await Domain.findOne({ _id, removed: { $exists: false } })
        .lean();

      if (!item) {
        return ctx.notFound({ message: 'Domain not found' });
      }
      await Domain.findOneAndUpdate(
        { _id },
        { $set: { removed: Date.now() } }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
