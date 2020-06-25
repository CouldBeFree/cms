import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Attribute from '../models/Attribute';
import AttributesGroup from '../models/AttributesGroup';
import Category from "../models/Category";
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/attributes', jwtAuth())
export default class AttributesCtrl {
  @get('', paginationMiddleware({
    query: ['title', 'label'],
    sorting: {
      default: { createDate: -1 }
    }
  }))
  async getItems (ctx) {
    const params = {
      'owner._id': ctx.state.owner._id,
      removed: { $exists: false }
    };

    if (ctx.query.attributeGroup && ctx.query.attributeGroup === 'null') {
      params.attributeGroup = { $exists: false };
    } else if (ctx.query.attributeGroup) {
      params['attributeGroup._id'] = ctx.query.attributeGroup;
    }

    if (ctx.pagination.query) {
      params.$or = ctx.pagination.query;
    }

    try {
      const items = await Attribute.find(params)
        .lean()
        .skip(ctx.pagination.skip)
        .limit(ctx.pagination.size)
        .sort(ctx.pagination.sorting);

      ctx.set('x-total-count', await Attribute.count(params));

      ctx.ok(items);
    } catch (err) {
      ctx.status = 500;
      ctx.ok({ message: err.message });
    }
  }

  @post('')
  async createItem (ctx) {
    try {
      const { title, attributeGroup } = ctx.request.body;

      const existItem = await Attribute.findOne({
        'owner._id': ctx.state.owner._id,
        $or: [{ title }],
        removed: { $exists: false }
      });
      if (existItem) {
        return ctx.badRequest({ message: 'Attribute with this title already exists' })
      }

      const item = new Attribute(ctx.request.body);

      if (attributeGroup && attributeGroup._id) {
        const attributeGroupDb = await AttributesGroup.findOne({
          'owner._id': ctx.state.owner._id,
          _id: attributeGroup._id
        }, {
          _id: 1,
          title: 1,
          attributes: 1
        });
        if (!item.attributeGroup) {
          return ctx.badRequest({ message: 'Attribute group not found' })
        }
        attributeGroupDb.attributes = attributeGroupDb.attributes || [];
        attributeGroupDb.attributes.push(item);

        await attributeGroupDb.save();
        item.attributeGroup = attributeGroupDb;
      }
      item.owner = ctx.state.owner;
      await item.save();

      ctx.ok({ _id: item._id });
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @put('/:_id')
  async updateItem (ctx) {
    try {
      const { attributeGroup } = ctx.request.body;
      const item = await Attribute.findOne({
        'owner._id': ctx.state.owner._id,
        _id: ctx.params._id
      });
      if (!item) {
        return ctx.badRequest({ message: 'Attribute not found' })
      }
      _.assign(item, ctx.request.body);

      if (attributeGroup && attributeGroup._id) {
        const attributeGroupDb = await AttributesGroup.findOne({
          'owner._id': ctx.state.owner._id,
          _id: attributeGroup._id
        }, {
          _id: 1,
          title: 1,
          attributes: 1
        });
        if (!attributeGroupDb) {
          return ctx.badRequest({ message: 'Attribute group not found' })
        }
        attributeGroupDb.attributes = attributeGroupDb.attributes || [];
        if (!_.find(attributeGroupDb.attributes, { _id: item._id })) {
          attributeGroupDb.attributes.push(item);
        }

        await AttributesGroup.update({
            'owner._id': ctx.state.owner._id,
            _id: { $ne: attributeGroupDb._id }
          },
          { $pull: { attributes: { _id: item._id } } },
          { multi: true }
        );
        await attributeGroupDb.save();

        item.attributeGroup = attributeGroupDb;
      }
      await item.save();

      ctx.noContent();
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @get('/:_id')
  async getItem (ctx) {
    const item = await Attribute.findOne({
      'owner._id': ctx.state.owner._id,
      _id: ctx.params._id
    }).lean();
    if (!item) {
      return ctx.notFound({ message: 'Account not found' });
    }
    ctx.ok(item);
  }

  @del('/')
  async deleteAttrs (ctx) {
    const { ids } = ctx.request.body;
    try {
      let items = await Attribute.find({
        'owner._id': ctx.state.owner._id,
        _id: { $in: ids },
        removed: { $exists: false }
      }, { _id: 1 }).lean();

      let result = {
        success: [],
        failed: []
      };

      for (let item of items) {
        await Attribute.findOneAndUpdate(
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
