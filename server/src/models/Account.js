import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp-plugin';
import { DataOwnerEmbedSchema } from './DataOwner';

const modelName = 'Account';

export const ACCOUNT_TYPE_ADMIN = 'admin';
export const ACCOUNT_TYPE_CLIENT = 'client';
export const ACCOUNT_TYPE_SUPPORT = 'support';

export const ACCOUNT_TYPES = [
  ACCOUNT_TYPE_ADMIN,
  ACCOUNT_TYPE_CLIENT,
  ACCOUNT_TYPE_SUPPORT
];

const Schema = new mongoose.Schema({
  owner: DataOwnerEmbedSchema,

  canSudo: Boolean,

  accountType: { type: String, default: 'client', enum: ACCOUNT_TYPES },
  authType: { type: String, default: 'system', enum: ['system', 'facebook', 'twitter', 'google', 'linkedin'] },

  // login fields
  email: String,
  username: {
    type: String,
    required: [true, 'Username field required']
  },
  password: {
    type: String,
    required: [true, 'Password field required']
  },
  salt: {
    type: String,
    required: [true, 'Salt field required']
  },

  // Personal info
  firstName: String,
  lastName: String,

  // activation
  activated: { type: Boolean, required: true, default: false },
  activationDate: Date,
  activationToken: String,

  loginDate: Date, // last user login
  activityDate: Date, // last user activity

  // required by ResourceService
  removed: Date,

  // for migration
  oldId: Number
}, {
  collection: 'data.accounts'
});

Schema.index({ username: 1 }, { unique: true });
Schema.plugin(timestamp);

export default mongoose.model(modelName, Schema);
