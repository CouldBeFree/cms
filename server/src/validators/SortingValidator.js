import Joi from '../lib/joi';

const SortingRequestValidator = {
    'sorting.prop': Joi.string().description('Sorting property'),
    'sorting.order': Joi.string().description('Sorting order')
};

export {SortingRequestValidator};