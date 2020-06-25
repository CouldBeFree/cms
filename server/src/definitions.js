import Joi from './lib/joi';

export const CategoryEmbed = Joi.object().keys({
  _id: Joi.string().required(),
  title: Joi.string().required()
});

export const DataItem = Joi.object().keys({
  _id: Joi.string().required(),

  sku: Joi.string().required(),
  title: Joi.string().required(),

  category: CategoryEmbed,

  images: Joi.array(),
  attributes: Joi.array()
});

export const DataItemsList = Joi.array().items(DataItem);

export const ErrorResponse = Joi.object().keys({
  message: Joi.string().required()
});
