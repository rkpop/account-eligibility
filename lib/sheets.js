const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CRED_PATH = path.join(__dirname, "..", "credentials.json");
const TOKEN_PATH = path.join(__dirname, "..", "token.json");
var SheetsClass = null;

async function api_init() {
  let credentials = JSON.parse(fs.readFileSync(CRED_PATH));
  let token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oauth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oauth.setCredentials(token);
  return new Sheets(oauth);
}

const generateInstance = auth => {
  SheetsClass = new Sheets(auth);
};
const getInstance = () => {
  return SheetsClass;
};

class Sheets {
  constructor(auth) {
    this.auth = auth;
    console.log(this.auth);
  }
}

api_init().then(result => console.log(result));
