const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const formidable = require("formidable");
const session = require("express-session");
const passport = require("passport");

const create = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let post = new Post(fields);
    post.postedBy = req.profile;
    post.username=String(req.profile.name)
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
      post.hasphoto=1
    }
    else
      post.hasphoto=0
    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      updateScore(req.profile._id, 2);
      res.json(result);
    });
  });
};

const postByID = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name").populate("likes").populate("comments.likes").populate("comments.incomments.postedBy")
    .exec((err, post) => {
      if (err || !post)
        return res.status("400").json({
          error: "Post not found",
        });
      req.post = post;
      next();
    });
};

const listByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name").populate("comments.likes").populate("comments.incomments.postedBy").populate("likes")
    .populate("postedBy", "_id name")
    .sort("-created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

const listNewsFeed = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  Post.find({ postedBy: { $in: req.profile.following } })
    .populate("comments", "text created").populate("likes")
    .populate("comments.postedBy", "_id name").populate("comments.likes").populate("comments.incomments.postedBy")
    .populate("postedBy", "_id name")
    .sort("-created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

const remove = (req, res) => {
  let post = req.post;
  post.remove((err, deletedPost) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(deletedPost);
  });
};

const photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

const like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const likeacomment = (req, res) => {
  
  Post.findOneAndUpdate(
    {
      _id: req.body.postId,
      "comments.text": req.body.comment,
      "comments.postedBy": req.body.postedBy,
    },
    { $push: { "comments.$.likes": req.body.userId } }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const unlikeacomment=(req,res)=>{
  Post.findOneAndUpdate(
    {
      _id: req.body.postId,
      "comments.text": req.body.comment,
      "comments.postedBy": req.body.postedBy,
    },
    { $pull: { "comments.$.likes": req.body.userId } }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
}

const commentincomment = (req, res) => {
  var changes = {
    text: req.body.comtext,
    postedBy: req.body.userId,
    
  };
  Post.findOneAndUpdate(
    { _id: req.body.postId, "comments.text": req.body.comment },
    { $push: { "comments.$.incomments": changes } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    updateScore(req.body.userId, 1);
    res.json(result);
  });
};
const uncommentincomment = (req, res) => {
  var changes = {
    text: req.body.comtext,
    postedBy: req.body.userId,
    
  };
  Post.findOneAndUpdate(
    { _id: req.body.postId, "comments.text": req.body.comment },
    { $pull: { "comments.$.incomments": changes } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    updateScore(req.body.userId, 1);
    res.json(result);
  });
};

const comment = (req, res) => {
  var commentf = {
    text: req.body.comment,
    postedBy: req.body.userId,
    likes:[]
  
    
  };

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: commentf } },
    { new: true }
  )
    .populate("comments.postedBy")
    .populate("postedBy")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      
      res.json(result);
    });
};
const uncomment = (req, res) => {
  let comment = req.body.comment;
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
};

const isPoster = (req, res, next) => {
  let isPoster = (String(req.user._id) === String(req.post.postedBy._id));
  let isPosteradmin=req.user.role=="Admin"
  if (isPoster||isPosteradmin) {
   next()
  }
  else
  {
  return res.status("403").json({
    error: "User is not authorized! login now",
  });
}
};

const updateScore = (userId, points) => {
  User.findOneAndUpdate({ _id: userId }, { $mul: { score: points } }).exec(
    (err, result) => {
      if (err) {
        return err;
      }
    }
  );
};

const trendingposts = (req, res) => {
  Post.find({}, function (err, docs) {
    if(docs.length==0)
       res.send("No posts")
    docs.forEach(function (data) {
      var id=data.id
      var likes = data.likes.length;
    
    
      var comments = data.comments.length;
      const date2 = new Date();
      const diffTime = Math.abs(date2 - data.created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      Post.findByIdAndUpdate(
        id,
        {$inc:{score: (likes*comments)/diffDays} },
        function (errr, doc) {
          if (errr) {
            console.log(err);
          }
        }
      );
      
      
    
    });
  }).exec((err, posts) => {
    if (err) {
      console.log(err)
    }
   
   

  });
  var mysort = { score: -1 };
      Post.find({}).populate('postedBy').populate('comments.postedBy').populate('comments.incomments.postedBy').populate("comments.likes").sort(mysort).exec((er,result)=>{
        if (er) res.json(er)
        else
          res.json(result)
      })
};

module.exports = {
  listByUser,
  listNewsFeed,
  create,
  postByID,
  remove,
  photo,
  like,
  unlike,
  comment,
  uncomment,
  isPoster,
  likeacomment,
  commentincomment,
  trendingposts,
  unlikeacomment,
  uncommentincomment
};
