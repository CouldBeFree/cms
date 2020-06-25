import Joi from '../lib/joi';
import { ErrorResponseValidator } from "./ErrorResponseValidator";
import { PAGINATION_QUERY } from "./_pagination";
import { ALL_ATTRIBUTE_TYPES } from "../shared/dataTypes";

const AttributeBase = {
    title: Joi.string().required().description('Attribute title'),
    label: Joi.string().allow('').description('Attribute label'),

    attributeGroup: Joi.object().keys({
        _id: Joi.string().objectId(),
        title: Joi.string()
    }),

    dataType: Joi.string().required().allow(ALL_ATTRIBUTE_TYPES.map(item => item.key))
};

const AttributeRequestValidator = Joi.object().keys(AttributeBase);
const AttributeGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...AttributeBase
});

const AttributeCreateValidator = Joi.object().keys({
    ...AttributeBase
});

const AttributeResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export {
    AttributeRequestValidator,
    AttributeResponseValidator,
    AttributeGetResponseValidator
};

const SWAGGER_GROUP = 'Attributes';
export default {
    getAttributes: {
        summary: 'Get attributes',
        tags: [SWAGGER_GROUP],
        parameters: {
            query: Joi.object().keys({
                attributeGroup: Joi.string(),
                ...PAGINATION_QUERY
            }),
        },
        responses: {
            '200': {
                schema: Joi.array().items(AttributeGetResponseValidator),
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
    getAttribute: {
        summary: 'Get attribute',
        tags: [SWAGGER_GROUP],
        parameters: {
        },
        responses: {
            '200': {
                schema: AttributeGetResponseValidator,
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
    createAttribute: {
        summary: 'Create new attribute',
        tags: [SWAGGER_GROUP],
        parameters: { body: AttributeCreateValidator },
        responses: {
            '200': {
                description: 'Created',
                schema: AttributeResponseValidator,
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
    updateAttribute: {
        summary: 'Update attribute',
        tags: [SWAGGER_GROUP],
        parameters: { body: AttributeCreateValidator },
        responses: {
            '204': {
                description: 'Updated',
                schema: Joi.string().allow(null),
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
};