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
} from '../shared/dataTypes';
import Joi from '../lib/joi';

const DataTypeAttribute = {
    name: Joi.string().required().description('Attribute system name'),
    title: Joi.string().allow('').description('Attribute title'),
    suffix: Joi.string().allow('').description('Attribute suffix'),

    editorType: Joi.string().required().valid([
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
    ]),

    values: Joi.array().items(Joi.object().keys({
        title: Joi.string().required().description('Title'),
        value: Joi.string().required().description('Value'),
        ordinal: Joi.number().integer().required().description('Value order in list')
    })),

    // remove
    oldId: Joi.number().integer().description('For migration from old system')
};

const DataTypeBase = {
    title: Joi.string().required().description('Data type title'),
    attributes: Joi.array().items(Joi.object().keys(DataTypeAttribute))
};

const DataTypeRequestValidator = Joi.object().keys(DataTypeBase);
const DataTypeGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...DataTypeBase
});

const DataTypeResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export { DataTypeRequestValidator, DataTypeResponseValidator, DataTypeGetResponseValidator, DataTypeAttribute };