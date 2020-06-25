import _ from 'lodash';
import { controller, get, put, post, del } from 'koa-dec-router';
import { paginationMiddleware } from '../middleware/pagination';

import Attribute from '../models/Attribute';
import AttributesGroup from '../models/AttributesGroup';
import Category from '../models/Category';
import { jwtAuth } from "../middleware/auth";

@controller('/api/v1/attributes-groups', jwtAuth())
export default class AttributesGroupsCtrl {
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

        try {
            const items = await AttributesGroup.find(params)
                .lean()
                .skip(ctx.pagination.skip)
                .limit(ctx.pagination.size)
                .sort(ctx.pagination.sorting);

            ctx.set('x-total-count', await AttributesGroup.count(params));

            ctx.ok(items);
        } catch (err) {
            ctx.status = 500;
            ctx.ok({ message: err.message });
        }
    }

    @get('/:_id')
    async getItem(ctx) {
        const item = await AttributesGroup.findOne({
            'owner._id': ctx.state.owner._id,
            _id: ctx.params._id
        }).lean();
        if (!item) {
            return ctx.notFound({ message: 'Attribute group not found' });
        }
        ctx.ok(item);
    }

    @post('')
    async createItem(ctx) {
        try {
            const { title } = ctx.request.body;

            const existItem = await AttributesGroup.findOne({
                'owner._id': ctx.state.owner._id,
                $or: [ { title } ]
            });
            if (existItem) {
                return ctx.badRequest({ message: 'Attribute group with this title already exists' })
            }

            const item = new AttributesGroup(ctx.request.body);
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
            let { attributeGroups, category }  = ctx.request.body;

            if (!category && (!attributeGroups || !attributeGroups.length)) {
                return ctx.ok([]);
            }
            if (category) {
                const categoryDb = await Category.findOne({
                    'owner._id': ctx.state.owner._id,
                    _id: category._id
                }, { 'attributeGroups._id': 1 });
                attributeGroups = categoryDb.attributeGroups.map(attr => attr._id);
            }
            const params = {
                'owner._id': ctx.state.owner._id,
                _id: { $in: attributeGroups }
            };
            const groups = await AttributesGroup.find(params);

            ctx.ok(groups);
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }

    @put('/:_id')
    async updateItem(ctx) {
        try {
            const body = ctx.request.body;

            const existItem = await AttributesGroup.findOne({
                'owner._id': ctx.state.owner._id,
                _id: ctx.params._id
            });
            if (!existItem) {
                return ctx.notFound({ message: 'Attribute group not found' })
            }
            const attributes = body.attributes || [];
            const ids = _.map(attributes, '_id');
            const foundAttributes = await Attribute.find({
                'owner._id': ctx.state.owner._id,
                _id: { $in: ids }
            });
            if (attributes.length !== foundAttributes.length) {
                return ctx.badRequest({ message: 'Wrong attributes' })
            }
            existItem.attributes = attributes;
            await existItem.save();

            await Attribute.update({
                'owner._id': ctx.state.owner._id,
                'attributeGroup._id': existItem._id
            }, { $unset: { attributeGroup: 1 } }, { multi: true });
            await Attribute.update({
                'owner._id': ctx.state.owner._id,
                _id: { $in: ids }
                }, { $set: { attributeGroup: existItem } }, { multi: true });

            ctx.noContent();
        } catch (err) {
            ctx.badRequest({ message: err.message });
        }
    }
}
