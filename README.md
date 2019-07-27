# Account Eligibility

## DEPRECATED. Use [Gateway](https://github.com/rkpop/gateway) instead.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

node.js app to check whether user's account age is eligible to do the voting/polling run by /r/kpop mods.

## Installation

* git clone

* `yarn install`

* obtain credentials.json and `token.json` (script soon) for Google Sheets API

* copy `sample.env` as `.env` and fill out the necessary keys

* source the file at terminal

* `nodemon .`

## Modify landing page

The page is written with Bulma and Sass.

Requirement:

* Yarn

Procedure:

* go to `static/`

* `yarn install`

* `yarn start`

* Make your changes at `main.scss` and `index.html`

* `yarn deploy`