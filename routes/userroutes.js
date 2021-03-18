const express = require("express");
const userCtrl = require("../controllers/userControllers");
const authCtrl=require('../controllers/authControllers')
const lbcontrol=require('../controllers/lbcontroller')


const router = express.Router();

router.route("/api/users").get(userCtrl.list).post(userCtrl.create);

router
  .route("/api/users/photo")
  .get(userCtrl.photo, userCtrl.defaultPhoto);
router.route("/api/users/defaultphoto").get(userCtrl.defaultPhoto);

router
  .route("/api/users/follow")
  .put(authCtrl.requireSignin, userCtrl.addFollowing, userCtrl.addFollower);
router
  .route("/api/users/unfollow")
  .put(
    authCtrl.requireSignin,
    userCtrl.removeFollowing,
    userCtrl.removeFollower
  );

router
  .route("/api/users/findpeople/:userId")
  .get(authCtrl.requireSignin, userCtrl.findPeople);

router
  .route("/api/users/:userId")
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);
router.route('/api/users/followers/:userId').get(userCtrl.getfollowers)
router.route('/api/users/following/:userId').get(userCtrl.getfollowing)
router.route("/leaderboard").get(lbcontrol.leaderboard)
router.route("/addphoto").put(authCtrl.requireSignin,userCtrl.uploadaimage)

router.param("userId", userCtrl.userByID);

module.exports = router;