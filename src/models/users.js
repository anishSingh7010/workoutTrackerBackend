import mongoose, { Schema } from 'mongoose';

const exerciseSchema = {
  exerciseType: {
    type: String,
    enum: ['push', 'pull', 'legs'],
    default: 'push',
  },
  name: { type: String },
};

const workoutSchema = {
  date: Date,
  exercises: [
    {
      // reps[0] and weights[0] would be first set
      reps: [Number],
      weights: [Number],
      _exercise: Schema.ObjectId,
    },
  ],
  volume: Number,
  name: String,
};

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
  exercises: { type: [exerciseSchema], default: [] },
  workouts: { type: [workoutSchema], default: [] },
});

let userModel = mongoose.model('User', userSchema);

// connecting to test database while testing with mocha and chai
if (process.env.NODE_ENV === 'test') {
  userModel = mongoose.connection.useDb('test').model('User', userSchema);
}

export default userModel;
