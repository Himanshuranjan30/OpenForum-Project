const express = require("express");
const userCtrl = require("../controllers/userControllers");
const authCtrl=require('../controllers/authControllers')
const postCtrl = require("../controllers/postControllers");

const router = express.Router();

router
  .route("/api/posts/new/:userId")
  .post(authCtrl.requireSignin, postCtrl.create);

router.route("/api/posts/photo/:postId").get(postCtrl.photo);

router
  .route("/api/posts/by/:userId")
  .get(authCtrl.requireSignin, postCtrl.listByUser);

router
  .route("/api/posts/feed/:userId")
  .get(authCtrl.requireSignin, postCtrl.listNewsFeed);

router.route("/api/posts/like").put(authCtrl.requireSignin, postCtrl.like);
router.route("/api/posts/unlike").put(authCtrl.requireSignin, postCtrl.unlike);

router
  .route("/api/posts/comment")
  .put(authCtrl.requireSignin, postCtrl.comment);
router
  .route("/api/posts/uncomment")
  .put(authCtrl.requireSignin, postCtrl.uncomment);

router
  .route("/api/posts/:postId")
  .delete(authCtrl.requireSignin, postCtrl.isPoster, postCtrl.remove);

router.route("/api/post/likeacomment").put(postCtrl.likeacomment)
router.route("/api/post/unlikeacomment").put(postCtrl.unlikeacomment)

router.route("/api/post/commentincomment").put(postCtrl.commentincomment)
router.route("/api/post/uncommentincomment").put(postCtrl.uncommentincomment)

router.route("/trendingposts").get(postCtrl.trendingposts)

router.param("userId", userCtrl.userByID);
router.param("postId", postCtrl.postByID);

module.exports = router;
