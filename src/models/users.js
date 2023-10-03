import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  active: {
    type: Boolean,
    default: false,
  },
  uniqueActivationId: { type: String },
});

export default model('User', userSchema);
