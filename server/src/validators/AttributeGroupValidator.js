import Joi from '../lib/joi';
import { ErrorResponseValidator } from "./ErrorResponseValidator";
import { PAGINATION_QUERY } from "./_pagination";

const AttributeGroupBase = {
    title: Joi.string().required().description('Attribute group title'),
    attributes: Joi.array().items(Joi.object().keys({
        _id: Joi.string().objectId(),
        title: Joi.string()
    }))
};

const AttributeGroupRequestValidator = Joi.object().keys(AttributeGroupBase);
const AttributeGroupGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...AttributeGroupBase
});

const AttributeGroupCreateValidator = Joi.object().keys({
    ...AttributeGroupBase
});

const AttributeGroupResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export {
    AttributeGroupRequestValidator,
    AttributeGroupResponseValidator,
    AttributeGroupGetResponseValidator
};

const SWAGGER_GROUP = 'AttributesGroups';
export default {
    getAttributesGroups: {
        summary: 'Get attributes groups',
        tags: [SWAGGER_GROUP],
        parameters: {
            query: Joi.object().keys({
                ...PAGINATION_QUERY
            }),
        },
        responses: {
            '200': {
                schema: Joi.array().items(AttributeGroupGetResponseValidator),
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
    createAttributeGroup: {
        summary: 'Create new data type',
        tags: [SWAGGER_GROUP],
        parameters: { body: AttributeGroupCreateValidator },
        responses: {
            '200': {
                description: 'Created',
                schema: AttributeGroupResponseValidator,
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    },
};