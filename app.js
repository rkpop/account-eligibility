const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const crypto = require("crypto");
const strat = require("passport-reddit").Strategy;
const luxon = require("luxon");
const api_init = require("./lib/sheets");

const REDDIT_ID = process.env.REDDIT_ID;
const REDDIT_SECRET = process.env.REDDIT_SECRET;
const CUTOFF_DATE = luxon.DateTime.utc(2019, 4, 11);

/* let GoogleSheets;
api_init().then(result => {
  GoogleSheets = result;
});
 */
const FAILURE_REDIRECT = "https://reddit.com/r/kpop";

let BASE_URL;
if (process.env.EXEC_MODE == "PROD") {
  BASE_URL = "http://poll.redditkpop.com";
} else {
  BASE_URL = "http://localhost:9999";
}

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 9999;
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new strat({
      clientID: REDDIT_ID,
      clientSecret: REDDIT_SECRET,
      callbackURL: `${BASE_URL}/auth/afterwards`
    },
    (accessToken, refreshToken, profile, done) => {
      if (parseUnix(profile._json.created_utc) > CUTOFF_DATE) {
        return done(null, null);
      } else {
        return done(null, profile);
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
app.use(express.static("static/"));

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
    failureRedirect: "/ineligible"
  }),
  (req, res) => {
    res.redirect("/ballot");
  }
);

app.get("/ballot", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  } else {
    return res.render("ballot.ejs");
  }
});

app.get("/ineligible", (_, res) => {
  res.sendFile(__dirname + "/static/ineligible.html");
});

app.listen(PORT);

// function to parse unix timestamp and convert it into Luxon.js datetime object
const parseUnix = timestamp => {
  return luxon.DateTime.fromSeconds(timestamp);
};