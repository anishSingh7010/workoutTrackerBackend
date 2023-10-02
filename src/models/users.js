import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, default: 'User' }],
  active: {
    type: Boolean,
    default: false,
  },
});

export default model('User', userSchema);
