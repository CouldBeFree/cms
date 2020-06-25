import Joi from "../lib/joi";

const ErrorResponseValidator = Joi.object().keys({
    code: Joi.number().integer(),
    message: Joi.string(),
    data: Joi.object(),
});

export { ErrorResponseValidator }