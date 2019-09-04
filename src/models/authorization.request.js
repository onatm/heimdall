/* eslint-disable babel/camelcase */
import mongoose, { Schema } from 'mongoose';
import nanoid from 'nanoid';

import Activation from './plugins/activation';

const AuthorizationRequestSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  client_id: {
    type: String,
    alias: 'clientId',
  },
  audience: [String],
  response_types: {
    type: [String],
    alias: 'responseTypes',
  },
  scopes: [String],
  state: String,
  nonce: String,
  redirect_uri: {
    type: String,
    alias: 'redirectURI',
  },
  provider_id: {
    type: String,
    alias: 'providerId',
  },
  expiry: Date,
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: false } });

AuthorizationRequestSchema.set('toJSON', { virtuals: true });
AuthorizationRequestSchema.plugin(Activation);

AuthorizationRequestSchema.index({ _id: 1, expiry: 1, is_active: 1 });

const AuthorizationRequest = mongoose.model('Authorization_Request', AuthorizationRequestSchema);

export default AuthorizationRequest;
