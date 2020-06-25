import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import PageRepo from '../repositories/PageRepo';
import Page from '../models/Page';
import Block from '../models/Block';
import { PageRepository } from "../repositories/Page";

export default
@controller('/api/v1/menu')
class MenuCtrl {
  @get('/:type')
  async getMenu (ctx) {
    const { domainId } = ctx.query;

    try {
      const menuItems = await PageRepository.getMenu(domainId, ctx.params.type);

      ctx.ok(menuItems);
    } catch (err) {
      ctx.badRequest({ message: err.message });
    }
  }
}
