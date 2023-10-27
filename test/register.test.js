import chai from 'chai';
import chaiHttp from 'chai-http';

import User from '../src/models/users.js';
import app from '../server.js';

process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('/register test', function () {
  it('should not register; missing email', function (done) {
    const user = {
      name: 'testUser',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    };
    chai
      .request(app)
      .post('/account/register')
      .set('content-type', 'application/json')
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        const resBody = res.body[0];
        resBody.should.have.property('path').to.be.equal('email');
        done();
      });
  });

  it('should not register; password too short', function (done) {
    const user = {
      email: 'abc@gmail.com',
      name: 'testUser',
      password: 'abc',
      confirmPassword: 'abc',
    };
    chai
      .request(app)
      .post('/account/register')
      .set('content-type', 'application/json')
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        const resBody = res.body[0];
        resBody.should.have.property('path').to.be.equal('password');
        done();
      });
  });

  it('should register; happy path', function (done) {
    const user = {
      email: 'test@test.com',
      name: 'test',
      password: 'test1234',
      confirmPassword: 'test1234',
    };
    chai
      .request(app)
      .post('/account/register')
      .set('content-type', 'application/json')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });
});
