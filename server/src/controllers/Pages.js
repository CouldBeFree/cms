import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import PageRepo from '../repositories/PageRepo';
import Page from '../models/Page';
import Block from '../models/Block';
import { PageRepository } from "../repositories/Page";

export default
@controller('/api/v1/pages')
class PagesCtrl {
  @get('', paginationMiddleware({
    query: ['name'],
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
        ctx.pagination.apply(Page.find(params, { blocks: 0 }).lean()),
        Page.countDocuments(params)
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

      const existItem = await Page.findOne({ $or: [{ name }], removed: { $exists: false } });
      if (existItem) {
        return ctx.badRequest({ message: 'Page with this name already exists' });
      }

      const item = new Page(ctx.request.body);

      await item.save();

      ctx.ok({ _id: item._id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @post('/find')
  async findPage (ctx) {
    try {
      const { domainId, url, error } = ctx.request.body;
      // const regExp = '(^' + url.replace(/([{}()[\]\\.?*+^$|=!:~-])/gi, "\\$1") + '$)';

      const existItem = error ? await PageRepository.getErrorPage(domainId) :
                                await PageRepository.getPageByUrl(domainId, url);
      // const existItem = await Page.findOne({ $or: [{ name: new RegExp(regExp,'i') }], removed: { $exists: false } });
      if (!existItem) {
        return ctx.badRequest({ message: 'Page not found' });
      }
      // const page = await PageRepo.loadDetailsForResponse(existItem);
      ctx.ok(existItem);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @put('/:_id')
  async updateItem (ctx) {
    try {
      const { name } = ctx.request.body;

      const item = await Page.findOne({ _id: ctx.params._id });
      if (!item) {
        return ctx.badRequest({ message: 'Page not found' });
      }
      const existItem = await Page.findOne({ $or: [{ name, _id: { $ne: ctx.params._id } }], removed: { $exists: false } });
      if (existItem) {
        return ctx.badRequest({ message: 'Page with this name already exists' });
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
    const item = await Page.findOne({ _id: ctx.params._id }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Page not found' });
    }
    ctx.ok(item);
  }

  @del('/:_id')
  async deleteAccount (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await Page.findOne({ _id, removed: { $exists: false } })
        .lean();

      if (!item) {
        return ctx.notFound({ message: 'Page not found' });
      }
      await Page.findOneAndUpdate(
        { _id },
        { $set: { removed: Date.now() } }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
