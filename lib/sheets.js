const fs = require("fs");
const path = require("path");
const util = require("util");
const { google } = require("googleapis");

const CRED_PATH = path.join(__dirname, "..", "credentials.json");
const TOKEN_PATH = path.join(__dirname, "..", "token.json");

async function api_init() {
  // god forgive me
  // I hate dealing with the entire async bs in node, so the I/O are done synchronously
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

class Sheets {
  constructor(auth, sheetId = process.env.SHEET_ID, range = "AuthUsers!A2:B") {
    this.auth = auth;
    this.sheets = google.sheets({ version: "v4", auth });
    this.input = {
      spreadsheetId: sheetId,
      range: range
    };
  }
  async findUsername(username) {
    const asyncF = util.promisify(this.sheets.spreadsheets.values.get);
    const data = await asyncF(this.input).catch(err => {
      console.error(err);
    });
    const rows = data.data.values || [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === username) {
        return true;
      }
    }
    return false;
  }
  async appendUsername(username) {
    const asyncF = util.promisify(this.sheets.spreadsheets.values.append);
    const response = await asyncF({
      ...this.input,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [[username]] }
    });
  }
}

let instance;
api_init().then(result => {
  (instance = result),
    instance.findUsername("jonicrecis").then(result => {
      if (!result) {
        instance.appendUsername("jonicrecis");
      }
    });
});

module.exports = { sheets_api: api_init };
