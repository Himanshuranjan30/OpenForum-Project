const express = require("express");
const mongoose = require("mongoose");
const app = express();
const config = require("./config");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fileUpload=require('express-fileupload')
require("dotenv").config();
const userRoutes = require("./routes/userroutes");
const authRoutes = require("./routes/authroutes");
const postRoutes = require("./routes/postroutes");
const passport = require("passport");
const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

const Tracing = require("@sentry/tracing");
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: "https://19ed905ee53849169855b8d10dcb66d5@o554315.ingest.sentry.io/5682735",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

setTimeout(() => {
  try {
    foo();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());

// the rest of your app

app.use(Sentry.Handlers.errorHandler());
var allowedDomains = [
  "https://accounts.google.com/o/oauth2/v2/auth",
  "http://localhost:3000",
  "https://openforumsocial.herokuapp.com/auth/google/callback",
  "https://open-forum-frontend.herokuapp.com"
];
app.use(fileUpload());
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieparser());
const CURRENT_WORKING_DIR = process.cwd();
console.log(CURRENT_WORKING_DIR);
app.use(express.static(path.join(CURRENT_WORKING_DIR, "./assets")));

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
