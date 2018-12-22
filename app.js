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
const CUTOFF_DATE = luxon.DateTime.utc(2019, 1, 1);

let GoogleSheets;
api_init().then(result => {
  GoogleSheets = result;
});

const FAILURE_REDIRECT = "https://reddit.com/r/kpop";

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
      if (parseUnix(profile._json.created_utc) > CUTOFF_DATE) {
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
app.set("view engine", "ejs");
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

app.get(
  "/auth/afterwards",
  passport.authenticate("reddit", {
    failureRedirect: FAILURE_REDIRECT
  }),
  (req, res) => {
    res.redirect("/ballot");
  }
);

app.get("/ballot", (req, res) => {
  if (!req.user) {
    res.redirect(FAILURE_REDIRECT);
  } else {
    return res.render("ballot.ejs", { username: req.user.name });
  }
});

app.listen(9999);

// function to parse unix timestamp and convert it into Luxon.js datetime object
const parseUnix = timestamp => {
  return luxon.DateTime.fromSeconds(timestamp);
};
