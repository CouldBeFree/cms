import Joi from '../lib/joi';

export
const PAGINATION_QUERY = {
    'page': Joi.number().allow('').integer().min(1),
    'size': Joi.number().allow('').integer().min(1),
    'query': Joi.string().allow(''),
};