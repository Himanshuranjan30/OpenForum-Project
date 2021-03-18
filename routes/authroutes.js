const express = require("express");
const authCtrl = require("../controllers/authControllers");
const passport = require("passport");
const router = express.Router();
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const config = require("../config");

const User = require("../models/user");
const jwt = require("jsonwebtoken");

var userProfile;

router.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
passport.use(
  new GoogleStrategy(
    {
      clientID:config.clientid,
      clientSecret: config.clientsecret,
      callbackURL: "https://openforumsocial.herokuapp.com/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router
  .route("/auth/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/error" }),
    async function (req, res) {
      var user = {
        id: userProfile["id"],
        name: userProfile["displayName"],

        email: userProfile["emails"][0]["value"],
        password: "Google",
      };
      let userdata = await User.findOne({
        email: user.email,
      });

      var userdata2 = new User(user);
      if (!userdata) {
        userdata2.save(function (error, result) {
          if (error) console.log(error);
          else {
            const token = jwt.sign(
              {
                _id: result._id,
              },
              config.jwtSecret
            );

            res.redirect("https://open-forum-frontend.herokuapp.com/login?token=" + token);
          }
        });
      } else {
        const token = jwt.sign(
          {
            _id: userdata._id,
          },
          config.jwtSecret
        );

        res.redirect("https://open-forum-frontend.herokuapp.com/login?token=" + token);
      }
    }
  );

router.get("/logout", (req, res) => {
  res.clearCookie("t");
  return res.status("200").json({
    message: "signed out successfully",
  });
});

router.route("/auth/signin").post(authCtrl.signin);
router.route("/auth/signout").get(authCtrl.signout);

module.exports = router;
