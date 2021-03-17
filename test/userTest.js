process.env.NODE_ENV = 'test';

const expect = require('expect');
const request = require('supertest');

const {app} = require('../app');
const User = require('../models/user');

var userId, token, otherUserId;

describe('New user creation', () => {
  it('Successfully signed up', (done) => {
    request(app)
      .post('/api/users')
      .send({
        name: "xyz",
        email: "xyz@gmail.com",
        password: "12345678",
        Country: "India",
        dob: "12-01-1998"
      })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it('Invalid data', (done) => {
    request(app)
      .post('/api/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it('User already exists', (done) => {
    request(app)
      .post('/api/users')
      .send({
        name: "xyz",
        email: "xyz@gmail.com",
        password: "12345678",
        Country: "India",
        dob: "12-01-1998"
      })
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });
});


describe('User signin', () => {
  it('Successful signin', (done) => {
    request(app)
      .post('/auth/signin')
      .send({
        email: "xyz@gmail.com",
        password: "12345678"
      })
      .expect(200)
      .then(response => {
        token = response.body.token;
        userId = response.body.user._id;
        done();
      })
      .catch(err => done(err));
  });

  it('Invalid credentials', (done) => {
    request(app)
      .post('/auth/signin')
      .send({
        email: "xyz@gmail.com",
        password: "asbdjksdjkcn"
      })
      .expect(401)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });

  it('User not found', (done) => {
    request(app)
      .post('/auth/signin')
      .send({
        email: "kdjkjf@gmail.com",
        password: "oidufydiqwe323"
      })
      .expect(401)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });
});

describe("Get user's profile photo", () => {
  it("Successfully fetched", (done) => {
    request(app)
      .get('/api/users/photo/' + userId)
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });
});

describe("Get all users", () => {
  it("Successfully fetched", (done) => {
    request(app)
      .get('/api/users/')
      .then(response => {
        users = response.body;
        done();
      })
      .catch(err => done(err));
  });
});

describe("", () => {
  it("", (done) => {
    if(users.length <= 1){
      request(app)
      .post('/api/users')
      .send({
        name: "ijk",
        email: "ijk@gmail.com",
        password: "12345678",
        Country: "India",
        dob: "12-01-1998"
      })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
    }
    else{
      done();
    }
  });

  it("", (done) => {
    request(app)
      .get('/api/users')
      .then(response => {
        Object.entries(response.body).every(item => {
          if(item[1]['_id'] != userId){
            otherUserId = item[1]['_id'];
            return false;
          }
          return true;
        });
        done();
      })
      .catch(err => done(err));
  })
})

describe("Follow a user", () => {
    it("Successfully followed", (done) => {
      request(app)
        .put('/api/users/follow')
        .set('authorization', token)
        .send({
            userId: userId,
            followId: otherUserId
        })
        .expect(200)
        .end((err, res) => {
          if(err)
            return done(err);
          done();
        });
    });

    it("Invalid followID", (done) => {
        request(app)
          .put('/api/users/follow')
          .set('authorization', token)
          .send({
              userId: userId,
              followId: ""
          })
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
    });

    it("Invalid userID", (done) => {
        request(app)
          .put('/api/users/follow')
          .set('authorization', token)
          .send({
              userId: '',
              followId: otherUserId
          })
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
    });
});

describe("Unfollow a user", () => {
    it("Successfully unfollowed", (done) => {
        request(app)
          .put('/api/users/unfollow')
          .set('authorization', token)
          .send({
              userId: userId,
              unfollowId: otherUserId
          })
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
      });
});

describe("Find people", () => {
    it("Successful in finding people", (done) => {
        request(app)
          .get('/api/users/findpeople/' + userId)
          .set('authorization', token)
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
    });
});

describe("Update user profile", () => {
    it("Successfully updated", (done) => {
        request(app)
          .put('/api/users/' + userId)
          .set('authorization', token)
          .field({name: "XYZ"})
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
    });
});

describe("User signout", () => {
  it("Successful signout", (done) => {
    request(app)
      .get('/auth/signout')
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });
});

module.exports = {otherUserId};

process.env.NODE_ENV = 'development';
