import {
    PLAINTEXT_TYPE,
    RICHTEXT_TYPE,
    IMAGE_TYPE,
    VIDEO_TYPE,
    LINK_TYPE,
    NUMBER_TYPE,
    DATETIME_TYPE,
    SWITCH_TYPE,
    OPTION_TYPE,
    LIST_TYPE
} from '../models/dataTypeAttribute';
import Joi from '../lib/joi';

const DataOwnerBase = {
    title: Joi.string().required().description('Data owner title')
};

const DataOwnerRequestValidator = Joi.object().keys(DataOwnerBase);
const DataOwnerGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...DataOwnerBase
});

const DataOwnerResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export { DataOwnerRequestValidator, DataOwnerResponseValidator, DataOwnerGetResponseValidator };