import { DataFileSchema } from '../models/dataFile';
import Joi from '../lib/joi';

const FileValidator = {
    _id: Joi.string().objectId().required(),
    filename: Joi.string().required().description('File name')
};

export { FileValidator };