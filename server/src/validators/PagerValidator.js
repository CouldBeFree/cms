import Joi from '../lib/joi';

const PagerRequestValidator = {
    'pager.page': Joi.number().required().description('Current page number'),
    'pager.count': Joi.number().required().description('Count per page')
};

const PagerResponseValidator = {
    page: Joi.number().required().description('Current page number'),
    count: Joi.number().required().description('Count per page'),
    total: Joi.number().description('Total items count'),
    skip: Joi.number().description('Skip from')
};

export {PagerRequestValidator, PagerResponseValidator};