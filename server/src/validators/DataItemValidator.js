import {DataTypeAttribute} from './DataTypeValidator';
import {FileValidator} from './FileValidator';
import {PagerResponseValidator} from './PagerValidator';
import Joi from '../lib/joi';

const DataItemBase = {
    oldId: Joi.number(),
    extId: Joi.string().allow(null),
    title: Joi.string().required().description('Data item title'),
    createDate: Joi.date().description('Create date'),
    modifyDate: Joi.date().description('Modify date'),
    keys: Joi.array().items(Joi.string()),
    attributes: Joi.array().items(Joi.object().keys({
        value: Joi.string().allow(''),

        ...DataTypeAttribute
    })),
    sortAttributes: Joi.any(),
    category: Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string()
    }),
    owner: Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string()
    }),
    images: Joi.array().items(Joi.object().keys({
        value: Joi.string().allow(''),

        ...FileValidator
    }))
};

const DataItemRequestValidator = Joi.object().keys(DataItemBase);
const DataItemGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...DataItemBase
});

const DataItemsGetResponseValidator = Joi.object().keys({
    pager: PagerResponseValidator,
    data: Joi.array().items(DataItemGetResponseValidator),
});


const DataItemResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export {DataItemRequestValidator, DataItemsGetResponseValidator, DataItemResponseValidator, DataItemGetResponseValidator};