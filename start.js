"use strict";

let boot = require("./index.js");

try {
    boot.start();
}
catch (e) {
    console.log(e.stack);
    process.exit();
}