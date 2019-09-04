/* eslint-disable no-return-assign */
/* eslint-disable babel/no-invalid-this */
/* eslint-disable babel/camelcase */
import mongoose, { Schema } from 'mongoose';
import nanoid from 'nanoid';

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

const AuthorizationRequest = mongoose.model('Authorization_Request', AuthorizationRequestSchema);

export default AuthorizationRequest;
