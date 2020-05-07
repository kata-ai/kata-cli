"use strict";
const path = require("path");
const merapi = require("merapi");
const yaml = require("js-yaml");
const fs = require("fs");
const config =  yaml.safeLoad(fs.readFileSync(`${__dirname}/service.yml`, "utf8"));
config.package = require(`${__dirname}/package`);

module.exports = merapi({
    basepath: path.resolve(__dirname, "lib"),
    config: config,
    delimiters: {left: "${", right: "}"}
});
