const express = require("express");
const passport = require("passport");
const util = require("util");
const crypto = require("crypto");
const strat = require("passport-reddit").Strategy;

const REDDIT_ID = process.env.REDDIT_ID;
const REDDIT_SECRET = process.env.REDDIT_SECRET;
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
    (accessToken, refreshToken, profile, done) => {}
  )
);
