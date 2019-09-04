/* eslint-disable babel/camelcase */
import mongoose, { Schema } from 'mongoose';
import nanoid from 'nanoid';

const AccountSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  username: String,
  email: String,
  name: String,
  identities: {
    type: Map,
    of: {
      _id: false,
      user_id: String,
      access_token: String,
    },
  },
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

AccountSchema.set('toJSON', { virtuals: true });

AccountSchema.index({ email: 1 });

const Account = mongoose.model('Account', AccountSchema);

export default Account;
