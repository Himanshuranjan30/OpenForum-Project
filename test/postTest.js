process.env.NODE_ENV = 'test';

const expect = require('expect');
const request = require('supertest');

const {app} = require('../app');
const User = require('../models/user');
const Post = require('../models/post');
var otherUserId = require('./userTest').otherUserId;

var userId, token, postId, username, commentId, otherPostId, posts;

describe('User signin while creating a post', () => {
    it('Successful signin', (done) => {
      request(app)
        .post('/auth/signin')
        .send({
          email: "ijk@gmail.com",
          password: "12345678"
        })
        .expect(200)
        .then(response => {
          token = response.body.token;
          userId = response.body.user._id;
          username = response.body.user.name;
          done();
        })
        .catch(err => done(err));
    });
});

describe("Get posts of a particular user", () => {
  it("Successfully fetched", (done) => {
    request(app)
      .get('/api/posts/by/' + userId)
      .set('authorization', token)
      .then(response => {
        posts = response.body;
        done();
      })
      .catch(err => done(err));
  })

  it("", (done) => {
    if(Object.keys(posts).length < 1){
      request(app)
        .post('/api/posts/new/' + userId)
        .set('authorization', token)
        .field("title", 'A post')
        .field("text", "This is a post")
        .field("username", username)
        .expect(200)
        .then(response => {
          otherPostId = response.body._id;
          done();
        })
        .catch(err => done(err));
    }
    else {
      Object.entries(posts).every(item => {
        otherPostId = item[1]['_id'];
        return false;
      });
      done();
    }
  })
})

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

describe('User signin while creating a post', () => {
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
        username = response.body.user.name;
        done();
      })
      .catch(err => done(err));
  });
});

describe("Create a new post", () => {
    it("Successfully created a new post", (done) => {
        request(app)
          .post('/api/posts/new/' + userId)
          .set('authorization', token)
          .send({title: 'New post', text: 'This is my new post', username: username})
          .expect(200)
          .then(response => {
            postId = response.body._id;
            done();
          })
          .catch(err => done(err));
    });    
});

describe("Like a post", () => {
    it("Successfully liked a post", (done) => {
        request(app)
          .put('/api/posts/like')
          .set('authorization', token)
          .send({postId: otherPostId, userId: userId})
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          })
    });
});

describe("Dislike a post", () => {
    it("Successfully disliked a post", (done) => {
        request(app)
          .put('/api/posts/unlike')
          .set('authorization', token)
          .send({postId: otherPostId, userId: userId})
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          })
    });
});

describe("Display leaderboard", () => {
    it("Successfully displayed the leaderboard", (done) => {
        request(app)
          .get('/leaderboard')
          .expect(200)
          .end((err, res) => {
            if(err)
              return done(err);
            done();
          });
    });
});

describe("Get trending posts", () => {
  it("Successfully displayed trending posts", (done) => {
    request(app)
      .get('/trendingposts')
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });
});

describe("Delete a user", () => {
  it("Successfully deleted", (done) => {
    request(app)
      .delete('/api/users/' + userId)
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });

  it("Unauthorized", (done) => {
    request(app)
      .delete('/api/users/' + otherUserId)
      .set('authorization', token)
      .expect(400)
      .end((err, res) => {
        if(err)
          return done(err);
        done();
      });
  });
});

process.env.NODE_ENV = 'development';
