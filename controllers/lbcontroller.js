const Post = require("../models/post");

const User = require("../models/user");

const leaderboard = (req, res) => {
  Post.find({}, function (err, docs) {
    docs.forEach(async function (data) {
      var userid = data.postedBy;
      var likes = data.likes.length;

      var comments = data.comments.length;
      const date2 = new Date();
      const diffTime = Math.abs(date2 - data.created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const scoretoupdate = (likes * comments) / diffDays;
      const score = await User.findById(userid, { score: 1 });

      var badgetoupdate = "Level 1 Contributor";
      var totalscore=parseInt(score.score)+scoretoupdate
      
      if (totalscore> 200 && totalscore< 500)
        badgetoupdate = "Level 2 Contributor";
      else if (score.score + scoretoupdate >= 500)
        badgetoupdate = "Level 3 Contributor";
      
      

      User.findByIdAndUpdate(
        userid,
        {
          $inc: { score: (likes * comments) / diffDays },
        },
        function (errr, doc) {
          if (errr) {
            console.log(err);
          }
        }
      );
      User.findByIdAndUpdate(
        userid,
        { $set: { badge: badgetoupdate } },
        function (error, result) {
          if (error) console.log(error);
        }
      );
    });
  }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
  });
  var mysort = { score: -1 };
  User.find()
    .sort(mysort)
    .limit(10)
    .exec((errrr, result) => {
      if (errrr) console.log("error");
      else res.json(result);
    });
};

module.exports = { leaderboard };
