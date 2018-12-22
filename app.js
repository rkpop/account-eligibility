const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const util = require("util");
const crypto = require("crypto");
const strat = require("passport-reddit").Strategy;
const luxon = require("luxon");
const api_init = require("./lib/sheets");

const REDDIT_ID = process.env.REDDIT_ID;
const REDDIT_SECRET = process.env.REDDIT_SECRET;
let GoogleSheets;
api_init().then(result => {
  GoogleSheets = result;
});

let BASE_URL;
if (process.env.EXEC_MODE == "PROD") {
  BASE_URL = "https://awards.redditkpop.com";
} else {
  BASE_URL = "http://localhost:9999";
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new strat(
    {
      clientID: REDDIT_ID,
      clientSecret: REDDIT_SECRET,
      callbackURL: `${BASE_URL}/auth/afterwards`
    },
    (accessToken, refreshToken, profile, done) => {
      if (
        luxon.DateTime.fromSeconds(profile._json.created_utc) >
        luxon.DateTime.utc(2019, 12, 22)
      ) {
        return done(null, null);
      } else {
        GoogleSheets.findUsername(profile.name).then(result => {
          if (!result) {
            let _ = GoogleSheets.appendUsername(profile.name);
          }
          return done(null, profile);
        });
      }
    }
  )
);

const app = express();
app.use(
  expressSession({
    secret: "youtubeyoutubeyoutubeisbetterthantv",
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/auth", (req, res, next) => {
  req.session.state = crypto.randomBytes(32).toString("hex");
  passport.authenticate("reddit", {
    scope: ["identity"],
    state: req.session.state
  })(req, res, next);
});

app.get("/auth/afterwards", passport.authenticate("reddit"), (req, res) => {
  res.redirect("/ballot");
});

app.get("/ballot", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.send(`Hi, ${req.user.name}`);
});
app.listen(9999);
