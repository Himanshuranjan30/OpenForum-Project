const Post = require("../models/post");
const User = require("../models/user");

const leaderboard = (req, res) => {
  console.log("himu");
  Post.find({}, function (err, docs) {
    docs.forEach(function (data) {
      var userid = data.postedBy;
      console.log(userid);
      var likes = data.likes.length;
      console.log(likes);
      var comments = data.comments.length;
      console.log(comments);
      const date2 = new Date();
      const diffTime = Math.abs(date2 - data.created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(diffDays);
      const updated = User.findByIdAndUpdate(
        userid,
        {score: diffDays },
        function (errr, doc) {
          if (errr) {
            console.log(err);
          } else {
            console.log("Updated User : ", doc);
          }
        }
      );
    
    });
  }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(posts);
  });
};

module.exports = { leaderboard };
