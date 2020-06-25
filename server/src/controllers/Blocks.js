import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Block from '../models/Block';
import TasksService from '../services/TasksService';
import Attribute from "../models/Attribute";

export default
@controller('/api/v1/blocks')
class BlocksCtrl {
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
        ctx.pagination.apply(Block.find(params, { imagePreview: 0, source: 0, compiled: 0 }).lean()),
        Block.countDocuments(params)
      ]);
      ctx.set('x-total-count', count);
      ctx.ok(items);
    } catch (err) {
      ctx.status = 500;
      ctx.ok({ message: err.message });
    }
  }

  @get('/:_id/image')
  async getImage (ctx) {
    const item = await Block.findOne({ _id: ctx.params._id });
    if (!item) {
      return ctx.badRequest({ message: 'Block not found' });
    }
    if (item.imagePreview) {
      ctx.imagePng(item.imagePreview);
    }
  }

  @post('')
  async createItem (ctx) {
    try {
      const { title } = ctx.request.body;

      const existItem = await Block.findOne({ $or: [{ title }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Block with this title already exists' });
      }

      const item = new Block(ctx.request.body);
      item.pans = ['details', 'html', 'css', 'js'];
      await item.save();

      item.html.source = `<section class="section-${item.blockId}">\n\nNew section\n\n</section>`;
      item.css.source = `.section-${item.blockId} {\n   color: red;\n}`;

      await item.save();

      ctx.ok({ _id: item._id });

      await runTaskRenderBlock(item);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @put('/:_id')
  async updateItem (ctx) {
    try {
      const { title } = ctx.request.body;

      const item = await Block.findOne({ _id: ctx.params._id });
      if (!item) {
        return ctx.badRequest({ message: 'Block not found' });
      }
      const existItem = await Block.findOne({ $or: [{ title, _id: { $ne: ctx.params._id } }] });
      if (existItem) {
        return ctx.badRequest({ message: 'Block with this title already exists' });
      }

      _.assign(item, ctx.request.body);

      await item.save();

      ctx.noContent();

      await runTaskRenderBlock(item);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @get('/:_id')
  async getItem (ctx) {
    const item = await Block.findOne({ _id: ctx.params._id }, { imagePreview: 0 }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Block not found' });
    }
    ctx.ok(item);
  }

  @del('/:_id')
  async deleteBlock (ctx) {
    const { _id } = ctx.params;
    try {
      let item = await Block.findOne({ _id, removed: { $exists: false } })
        .lean();

      if (!item) {
        return ctx.notFound({ message: 'Block not found' });
      }
      await Block.findOneAndUpdate(
        { _id },
        { $set: { removed: Date.now() } }
      );
      ctx.ok({ _id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @del('/')
  async deleteBlocks (ctx) {
    const { ids } = ctx.request.body;
    try {
      let items = await Block.find({ _id: { $in: ids }, removed: { $exists: false } }, { _id: 1 })
        .lean();

      let result = {
        success: [],
        failed: []
      };

      for (let item of items) {
        await Block.findOneAndUpdate(
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

async function runTaskRenderBlock(block) {
  const tasks = new TasksService();
  await tasks.init();
  tasks.runTask('block.render', { _id: block._id });
  tasks.stop();
}
