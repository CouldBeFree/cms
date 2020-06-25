import pkg from '../package.json';
import Joi from './lib/joi';
import {
  DataItem,
  DataItemsList,
  ErrorResponse
} from './definitions';

export default {
  swagger: '2.0',
  info: {
    title: `${pkg.name} webservice`,
// description: '',
    version: pkg.version,
    "x-logo": {
      "url": "",
      "backgroundColor": "#fafafa"
    },
  },
  schemes: ['http', 'https'],
  host: 'localhost:5000',
  basePath: '/api',
  consumes: ['application/json'],
  produces: ['application/json'],
  paths: {
    '/v1/data': {
      get: {
        summary: 'Get a list of data items',
        tags: ['DataItem'],
        parameters: {
          query: Joi.object().keys({
            'category._id': Joi.string(),
            limit: Joi.number().integer().description("Maximum number of stations to return"),
          }),
          pathParams: Joi.object().keys({ orgName: Joi.string().description("Name of the station's organization"), }),
        },
        responses: {
          '200': {
            schema: DataItemsList,
            description: "List of station IDs",
          },
          'default': {
            schema: ErrorResponse,
            description: "Error",
          },
        }
      }
    }
  },
}
