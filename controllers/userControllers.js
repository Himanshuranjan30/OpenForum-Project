const User = require("../models/user");

const AWS = require("aws-sdk");
const path = require("path");
const config = require("../config");
const s3 = new AWS.S3({
  accessKeyId: config.awsid,
  secretAccessKey: config.awssecret,
});

const uploadaimage = (req, res) => {
  var params = {
    Bucket: "imagestoreopenforum",
    Key:
      "userimages/" +
      Math.random().toString(36).substring(7) +
      path.extname(req.files["photo"].name),
    Body: req.files["photo"].data,
    ACL: "public-read",
  };
  s3.upload(params, function (perr, pres) {
    if (perr) {
      console.log("Error uploading data: ", perr);
    } else {
      User.findByIdAndUpdate(req.query.id, {
        $set: {
          photo: pres.Location,
        },
      }).exec();
      res.send(pres);
    }
  });
};

const create = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(200).json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
      .populate("following", "_id name photo")
      .populate("followers", "_id name photo")
      .exec();
    if (!user)
      return res.status("400").json({
        error: "User not found",
      });
    req.profile = user;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve user",
    });
  }
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

const list = async (req, res) => {
  try {
    let users = await User.find().select("name email updated created");
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const update = (req, res) => {
  let user = req.profile;
  user.name = req.query.name;
  user.email = req.query.email;
  var params = {
    Bucket: "imagestoreopenforum",
    Key: "userimages/" + req.profile.id + path.extname(req.files["photo"].name),
    Body: req.files["photo"].data,
  };
  s3.upload(params, function (perr, pres) {
    if (perr) {
      console.log("Error uploading data: ", perr);
    } else {
      user.photo = pres.Location;
      user.save((err, result) => {
        if (err) res.json(err);
        else res.json(result);
      });
    }
  });
};

const remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const photo = async (req, res, next) => {
  let result = await User.findById(req.query.id, { photo: 1, _id: 0 });
  if (result) res.json(result);
  else next();
};

const defaultPhoto = (req, res) => {
  return res.sendFile(__dirname + "/profile.png");
};

const addFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { following: req.body.followId },
    });
    updateScore(req.body.userId, -0.5);
    next();
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const addFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.body.userId } },
      { new: true }
    )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec();
    result.hashed_password = undefined;
    result.salt = undefined;
    updateScore(req.body.followId, 1);
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const removeFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $pull: { following: req.body.unfollowId },
    });
    updateScore(req.body.userId, 0.5);
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.err,
    });
  }
};
const removeFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.body.userId } },
      { new: true }
    )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec();
    result.hashed_password = undefined;
    result.salt = undefined;
    updateScore(req.body.unfollowId, -1);
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const findPeople = async (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  try {
    let users = await User.find({ _id: { $nin: following } }).select({"name":1,"photo":1});
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const updateScore = (userId, points) => {
  User.findOneAndUpdate({ _id: userId }, { $inc: { score: points } }).exec(
    (err, result) => {
      if (err) {
        return err;
      }
    }
  );
};

const getfollowers = async (req, res) => {
  let followers = await User.findById(req.profile.id, { followers: 1 });
  if (followers) {
    res.json({ followerscount: followers.followers.length });
  } else res.send("error fetching followers");
};
const getfollowing = async (req, res) => {
  let following = await User.findById(req.profile.id, { following: 1 });
  if (following) {
    res.json({ followingcount: following.following.length });
  } else res.send("error fetching followings");
};

module.exports = {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  photo,
  defaultPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople,
  uploadaimage,
  getfollowers,
  getfollowing,
};
