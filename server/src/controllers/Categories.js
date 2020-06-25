import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Category from '../models/Category';
import Attribute from '../models/Attribute';
import AttributesGroup from '../models/AttributesGroup';
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/categories', jwtAuth())
export default class CategoriesCtrl {
    @get('', paginationMiddleware({
        query: [ 'title' ],
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

        if (ctx.query.withImport) {
            params['importSettings.enabled'] = true;
        }

        try {
            const items = await Category.find(params)
                .lean()
                .skip(ctx.pagination.skip)
                .limit(ctx.pagination.size)
                .sort(ctx.pagination.sorting);

            ctx.set('x-total-count', await Category.count(params));

            ctx.ok(items);
        } catch (err) {
            ctx.status = 500;
            ctx.ok({ message: err.message });
        }
    }

    @post('')
    async createItem(ctx) {
        try {
            const { title } = ctx.request.body;

            const existItem = await Category.findOne({ 'owner._id': ctx.state.owner._id, $or: [ { title } ] });
            if (existItem) {
                return ctx.badRequest({ message: 'Category with this title already exists' })
            }

            const item = new Category(ctx.request.body);
            item.owner = ctx.state.owner;
            await item.save();

            ctx.ok({ _id: item._id });
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @post('/search')
    async searchItems(ctx) {
        try {
            const { attributeGroups } = ctx.request.body;

            const params = {
                'owner._id': ctx.state.owner._id,
                $and: []
            };

            if (!attributeGroups || !attributeGroups.length) {
                return ctx.ok([]);
            }
            _.each(attributeGroups || [], group => {
                params.$and.push({ 'attributeGroups._id': group });
            });

            const categories = await Category.find(params);

            ctx.ok(categories);
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @put('/:_id')
    async updateItem(ctx) {
        try {
            const { attributeGroup } = ctx.request.body;
            const item = await Category.findOne({
                'owner._id': ctx.state.owner._id,
                _id: ctx.params._id
            });
            if (!item) {
                return ctx.badRequest({ message: 'Category not found' })
            }
            _.assign(item, ctx.request.body);

            await item.save();

            ctx.noContent();
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @put('/:_id/import')
    async updateImportSettings(ctx) {
        try {
            const item = await Category.findOne({
                'owner._id': ctx.state.owner._id,
                _id: ctx.params._id
            });
            if (!item) {
                return ctx.badRequest({ message: 'Category not found' })
            }
            item.importSettings = ctx.request.body;
            await item.save();

            ctx.noContent();
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @get('/:_id')
    async getItem(ctx) {
        const item = await Category.findOne({
            'owner._id': ctx.state.owner._id,
            _id: ctx.params._id
        }).lean();
        if (!item) {
            return ctx.notFound({ message: 'Category not found' });
        }
        item.importSettings.columns = item.importSettings.columns || {};
        ctx.ok(item);
    }

    @get('/:_id/groups')
    async getItemAttributes(ctx) {
        const item = await Category.findOne({
            'owner._id': ctx.state.owner._id,
            _id: ctx.params._id
        }).lean();
        if (!item) {
            return ctx.notFound({ message: 'Category not found' });
        }
        const groupsIds = _.map(item.attributeGroups, '_id');
        let groups = await AttributesGroup.find({ _id: { $in: groupsIds }, removed: { $exists: false } }).lean();
        groups = _.sortBy(groups, group => groupsIds.indexOf(group._id));

        const attributes = await Attribute.find({ 'attributeGroup._id': { $in: groupsIds }, removed: { $exists: false } }).lean();
        for (let group of groups) {
            group.attributes = _.filter(attributes, attribute => attribute.attributeGroup._id.equals(group._id));
        }
        ctx.ok(groups);
    }

    @del('/:_id')
    async deleteAccount(ctx) {
        const { _id } = ctx.params;
        try {
            let item = await Category.findOne({
                _id,
                'owner._id': ctx.state.owner._id,
                removed: { $exists: false }
            })
                .lean();

            if (!item) {
                return ctx.notFound({});
            }
            await Category.findOneAndUpdate(
                { 'owner._id': ctx.state.owner._id, _id },
                { $set: { removed: Date.now() } }
            );
            ctx.ok({ _id });
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }
}
