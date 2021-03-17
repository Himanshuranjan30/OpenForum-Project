const express = require("express");
const mongoose = require("mongoose");
const app = express();
const config = require("./config");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const upload=require('express-fileupload')
require("dotenv").config();
const userRoutes = require("./routes/userroutes");
const authRoutes = require("./routes/authroutes");
const postRoutes = require("./routes/postroutes");
const passport = require("passport");
const mv=require('mv')

var allowedDomains = [
  "https://accounts.google.com/o/oauth2/v2/auth",
  "http://localhost:3000",
  "https://openforumsocial.herokuapp.com/auth/google/callback",
];
app.use(upload())
app.use('/userimages',express.static(path.join(__dirname, '/userimages')))

app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);
      console.log(origin);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.post('/userphoto',(req,res)=>{
  console.log("uplaoding...")
  if(req.files){
  console.log(req.files)
  var file=req.files['photo']
  var filename=req.query.id+path.extname(req.files['photo'].name)
  file.mv('./userimages/'+filename,function(err){
    if(err)
     res.send(err)
    else  
     res.send("file uplaoded")
  })
}
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieparser());
const CURRENT_WORKING_DIR = process.cwd();
console.log(CURRENT_WORKING_DIR);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === "test") {
  mongoose.connect(config.mongoTestUri, { useNewUrlParser: true }, () => {
    console.log("connected to testing db");
  });
} else {
  mongoose.connect(config.mongoUri, { useNewUrlParser: true }, () => {
    console.log("connected to db");
  });
}
mongoose.set("useFindAndModify", false);
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database`);
});
app.use("/", userRoutes);
app.use("/", authRoutes);
app.use("/", postRoutes);

app.listen(config.port);

module.exports = { app };
