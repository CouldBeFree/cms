import Joi from '../lib/joi';
import { ErrorResponseValidator } from './ErrorResponseValidator';

const SWAGGER_GROUP = 'Auth';
const AuthValidator = {
    // POST /token
    postToken: {
        summary: 'Login with username',
        tags: [SWAGGER_GROUP],
        parameters: {
            body: Joi.object().keys({
                'username': Joi.string(),
                'password': Joi.string()
            }),
        },
        responses: {
            '200': {
                schema: Joi.object().keys({
                    token: Joi.string(),
                    account: Joi.object().keys({
                        _id: Joi.string().objectId().required(),
                        username: Joi.string(),
                        email: Joi.string()
                    }),
                    owner: Joi.object().keys({
                        _id: Joi.string().objectId().required()
                    }),
                }),
            },
            'default': {
                description: 'Error happened',
                schema: ErrorResponseValidator,
            },
        }
    }
};

export { AuthValidator };
