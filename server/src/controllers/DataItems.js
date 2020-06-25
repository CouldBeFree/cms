import _ from 'lodash';
import mongoose from 'mongoose';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import DataItem from '../models/DataItem';
import AttributesGroup from '../models/AttributesGroup';
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/data', jwtAuth())
export default class DataItemsCtrl {
    @get('', paginationMiddleware({
        query: [ 'title', 'sku' ],
        sorting: {
            default: { createDate: -1 }
        }
    }))
    async getItems(ctx) {
        const params = {
            'owner._id': ctx.state.owner._id,
            removed: { $exists: false }
        };

        if (ctx.pagination.query) {
            params.$or = ctx.pagination.query;
        }

        if (ctx.query['category._id']) {
            params['category._id'] = ctx.query['category._id'];
        }

        try {
            const items = await DataItem.find(params)
                .lean()
                .skip(ctx.pagination.skip)
                .limit(ctx.pagination.size)
                .sort(ctx.pagination.sorting);

            ctx.set('x-total-count', await DataItem.count(params));

            ctx.ok(items);
        } catch (err) {
            ctx.status = 500;
            ctx.ok({ message: err.message });
        }
    }

    @post('')
    async createItem(ctx) {
        try {
            const { sku } = ctx.request.body;

            const existItem = await DataItem.findOne({
                $or: [ { sku } ],
                'owner._id': ctx.state.owner._id
            });
            if (existItem) {
                return ctx.badRequest({ message: 'DataItem with this SKU already exists' })
            }

            const item = new DataItem(ctx.request.body);
            item.owner = ctx.state.owner;

            await item.save();

            ctx.ok({ _id: item._id });
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @put('/:_id')
    async updateItem(ctx) {
        try {
            const item = await DataItem.findOne({
                _id: ctx.params._id,
                'owner._id': ctx.state.owner._id
            });
            if (!item) {
                return ctx.badRequest({ message: 'DataItem not found' })
            }
            _.assign(item, ctx.request.body);

            await item.save();

            ctx.noContent();
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @get('/:_id')
    async getItem(ctx) {
        const item = await DataItem.findOne({
            _id: ctx.params._id,
            'owner._id': ctx.state.owner._id
        }).lean();
        if (!item) {
            return ctx.notFound({ message: 'DataItem not found' });
        }
        delete item.__v;
        ctx.ok(item);
    }

    @del('/:_id')
    async deleteAccount(ctx) {
        const { _id } = ctx.params;
        try {
            let item = await Account.findOne({
                _id,
                'owner._id': ctx.state.owner._id,
                removed: { $exists: false }
            }).lean();

            if (!item) {
                return ctx.notFound({});
            }
            await Account.findOneAndUpdate(
                { _id },
                { $set: { removed: Date.now() } }
            );
            ctx.ok({ _id });
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }
}
