"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
const { Config } = require("merapi");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
class Compile extends merapi_1.Component {
    constructor(helper) {
        super();
        this.helper = helper;
        this.directives = {
            include(file, basepath, helper) {
                let ext = path.extname(file);
                if (ext === ".yml" || ext === ".yaml")
                    return helper.loadYaml(path.resolve(basepath, file));
                else if (ext === ".json")
                    return require(path.resolve(basepath, file));
                else
                    return fs.readFileSync(path.resolve(basepath, file)).toString();
            }
        };
    }
    execDirective(name, directive, dict, basepath) {
        for (let i in dict) {
            if (typeof dict[i] !== "string")
                continue;
            let val = dict[i].trim();
            if (val.indexOf("$" + name + "(") === 0 && val.charAt(val.length - 1) === ")") {
                dict[i] = directive(dict[i].substring(2 + name.length, dict[i].length - 1), basepath, this.helper);
            }
        }
    }
    execDirectives(config, basepath) {
        let flattened = config.flatten();
        for (let i in this.directives) {
            this.execDirective(i, this.directives[i], flattened, basepath);
        }
        return config.create(flattened);
    }
}
exports.default = Compile;
//# sourceMappingURL=compile.js.map