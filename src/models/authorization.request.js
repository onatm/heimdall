/* eslint-disable babel/camelcase */
import mongoose, { Schema } from 'mongoose';
import nanoid from 'nanoid';

const AuthorizationRequestSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  clientId: String,
  audience: [String],
  responseTypes: [String],
  scopes: [String],
  state: String,
  nonce: String,
  redirectURI: String,
  providerId: String,
  expiry: Date,
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: false } });

AuthorizationRequestSchema.set('toJSON', { virtuals: true });

const AuthorizationRequest = mongoose.model('Authorization_Request', AuthorizationRequestSchema);

export default AuthorizationRequest;
