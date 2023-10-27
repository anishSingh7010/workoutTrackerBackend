import chai from 'chai';
import chaiHttp from 'chai-http';

import User from '../src/models/users.js';

process.env.NODE_ENV = 'test';
const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

// deleting all users in test db
before(async () => {
  await User.deleteMany({});
});

// deleting all users in test db
after(async () => {
  await User.deleteMany({});
});
