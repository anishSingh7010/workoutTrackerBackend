import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  active: {
    type: Boolean,
    default: false,
  },
  uniqueActivationId: { type: String, default: '' },
  resetPasswordId: { type: String, default: '' },
});

let userModel = mongoose.model('User', userSchema);

// connecting to test database while testing with mocha and chai
if (process.env.NODE_ENV === 'test') {
  userModel = mongoose.connection.useDb('test').model('User', userSchema);
}

export default userModel;
