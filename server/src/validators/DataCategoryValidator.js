import Joi from '../lib/joi';

const DataCategoryBase = {
    title: Joi.string().required().description('Data type title'),
    dataFlowType: Joi.string().description('Data flow type'),
    sharedToOwners: Joi.array().items(Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string().required()
    })),
    owner: Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string().required()
    }),
    importSettings: Joi.object().keys({
        enabled: Joi.boolean().required(),
    }),
    sharingSettings: Joi.object().keys({
        enabled: Joi.boolean().required(),
    }),
    dataType: Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string().required()
    }),
    countItems: Joi.number().integer()
};

const DataCategoryRequestValidator = Joi.object().keys(DataCategoryBase);
const DataCategoryGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...DataCategoryBase
});

const DataCategoryImportSettingsResponseValidator = Joi.object().keys({
    importSettings: Joi.object().keys({
        enabled: Joi.boolean().required(),
        sourceUrl: Joi.string().allow('').optional(),
        adapterName: Joi.string().optional().valid([
            'mobile.de',
            'forklift.de',
            'ms-dynamics',
            'default'
        ]),
        executionInterval: Joi.number().integer(),
        executionType: Joi.string().optional().valid([
            'manual',
            'schedule'
        ]),
        notifications: Joi.object().keys({
            email: Joi.boolean().required()
        })
    })
});

const DataCategorySharingSettingsResponseValidator = Joi.object().keys({
    sharedToOwners: Joi.array().items(Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string().required()
    })),
    sharingSettings: Joi.object().keys({
        enabled: Joi.boolean().required()
    })
});

const DataCategoryResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export {
    DataCategoryRequestValidator,
    DataCategoryResponseValidator,
    DataCategoryGetResponseValidator,
    DataCategoryImportSettingsResponseValidator,
    DataCategorySharingSettingsResponseValidator
};