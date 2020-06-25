import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Account from '../models/Account';
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/accounts', jwtAuth())
export default class AccountsCtrl {
    @get('', paginationMiddleware({
        query: [ 'title' ],
        sorting: {
            default: { createDate: -1 }
        }
    }))
    async getItems(ctx) {
        const params = {
            removed: { $exists: false }
        };

        if (ctx.pagination.query) {
            params.$or = ctx.pagination.query;
        }

        try {
            const items = await Account.find(params)
                .lean()
                .skip(ctx.pagination.skip)
                .limit(ctx.pagination.size)
                .sort(ctx.pagination.sorting);

            ctx.set('x-total-count', await Account.count(params));

            ctx.ok(items);
        } catch (err) {
            ctx.status = 500;
            ctx.ok({ message: err.message });
        }
    }
}
