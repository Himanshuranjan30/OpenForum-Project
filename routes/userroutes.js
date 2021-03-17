const express = require("express");
const userCtrl = require("../controllers/userControllers");
const authCtrl=require('../controllers/authControllers')
const lbcontrol=require('../controllers/lbcontroller')
const multer=require('multer')
const path=require('path')
const diskStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'../userimages')

  },
  filename:(req,file,cb)=>{
    cb(null,req.query.id+path.extname(file.originalname))
  }

})

const upload=multer({storage:diskStorage})




const router = express.Router();

router.route("/api/users").get(userCtrl.list).post(userCtrl.create);

router
  .route("/api/users/photo/:userId")
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

router.route("/leaderboard").get(lbcontrol.leaderboard)


router.param("userId", userCtrl.userByID);

module.exports = router;