import _ from 'lodash';
import request from 'request-promise-native';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import PageRepo from '../repositories/PageRepo';
import Page from '../models/Page';
import Block from '../models/Block';
import Configuration from '../models/mysql/Configuration';
import Product from '../models/mysql/Product';
import { PageRepository } from "../repositories/Page";

export default
@controller('/api/v1/products')
class ProductsCtrl {
  @get('')
  async getItems (ctx) {
    const block = await Block.findById(ctx.query.blockId);
    if (!block) {
      return ctx.notFound({ message: 'Block not found' });
    }
    const params = { ...ctx.query };
    params.section_id = block.oldId;
    params.section = block.oldId;

    try {
      const res = await request.get({ uri: `https://www.fds-stapler.de/api/products`, qs: params });
      return ctx.ok(JSON.parse(res).data);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @get('/filter')
  async getFilter (ctx) {
    try {
      const configurationId = ctx.query.configurationId;
      try {
        const res = await request(`https://www.fds-stapler.de/api/configuration/${configurationId}/filter`, { params: ctx.query });
        return ctx.ok(JSON.parse(res));
      } catch (err) {
        ctx.badRequest({ message: err.message });
      }
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }

  @get('/:id')
  async getProduct (ctx) {
    const { id } = ctx.params;
    const block = await Block.findById(ctx.query.blockId);
    if (!block) {
      return ctx.notFound({ message: 'Block not found' });
    }
    const params = { ...ctx.query };
    params.section_id = block.oldId;
    params.section = block.oldId;
    params.configuration_id = params.configurationId;

    try {
      const res = await request.get({ uri: `https://www.fds-stapler.de/api/products/${id}`, qs: params });
      return ctx.ok(JSON.parse(res));
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
