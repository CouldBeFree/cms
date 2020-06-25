import {
    STATUS_NEW
} from '../models/dataImportJob';
import Joi from '../lib/joi';

const DataImportJobBase = {
    files: Joi.array().items(Joi.object().keys({
        _id: Joi.string().objectId().required(),
        filename: Joi.string()
    })),
    category: Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string()
    }),
    createDate: Joi.date(),
    currentStatus: Joi.object().default({ state: STATUS_NEW })
};

const DataImportJobRequestValidator = Joi.object().keys(DataImportJobBase);
const DataImportJobGetResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required(),
    ...DataImportJobBase
});

const DataImportJobImportSettingsResponseValidator = Joi.object().keys({
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

const DataImportJobSharingSettingsResponseValidator = Joi.object().keys({
    sharedToOwners: Joi.array().items(Joi.object().keys({
        _id: Joi.string().objectId().required(),
        title: Joi.string().required()
    })),
    sharingSettings: Joi.object().keys({
        enabled: Joi.boolean().required()
    })
});

const DataImportJobResponseValidator = Joi.object().keys({
    _id: Joi.string().objectId().required().description('id of affected item')
});

export {
    DataImportJobRequestValidator,
    DataImportJobResponseValidator,
    DataImportJobGetResponseValidator,
    DataImportJobImportSettingsResponseValidator,
    DataImportJobSharingSettingsResponseValidator
};