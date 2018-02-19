"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
const _ = require("lodash");
const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
class Helper extends merapi_1.Component {
    constructor(config) {
        super();
        this.config = config;
        this.printError = (error) => console.error(this.wrapError(error));
    }
    getFiles(dir, ending) {
        const fileList = fs.readdirSync(dir);
        const res = [];
        for (let i = 0; i < fileList.length; i++) {
            const stat = fs.statSync(path.resolve(dir, fileList[i]));
            if (stat.isDirectory()) {
                res.push(...this.getFiles(dir + "/" + fileList[i], ending));
            }
            else if (stat.isFile() && fileList[i].endsWith(ending)) {
                res.push(dir + "/" + fileList[i]);
            }
        }
        return res;
    }
    loadYaml(file) {
        return yaml.safeLoad(fs.readFileSync(file, "utf8"));
    }
    dumpYaml(file, object) {
        fs.writeFileSync(file, yaml.safeDump(object, { indent: 4, lineWidth: 150 }), "utf8");
    }
    compareTestResult(result, expect) {
        if (!result) {
            return null;
        }
        const errors = [];
        const expected = this.config.create(expect).flatten();
        const res = this.config.create(result);
        for (const i in expected) {
            const value = res.get(i);
            if (value !== expected[i]) {
                errors.push({ field: i, expect: expected[i], result: value });
            }
        }
        return errors;
    }
    setProp(prop, value, options) {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;
        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
        else {
            jsonProp = {};
        }
        jsonProp[prop] = value;
        fs.writeFileSync(jsonPath, JSON.stringify(jsonProp), "utf8");
    }
    getProp(prop, options) {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;
        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
        else {
            jsonProp = {};
        }
        return jsonProp[prop];
    }
    delete() {
        const jsonPath = `${os.homedir()}/.katajson`;
        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            return true;
        }
        return false;
    }
    toPromise(ctx, func, ...args) {
        return new Promise((resolve, reject) => {
            args.push((error, data, response) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ data, response });
                }
            });
            func.apply(ctx, args);
        });
    }
    getBotId() {
        const desc = this.loadYaml("./bot.yml");
        return desc.id;
    }
    createDirectory(dirPath, mode) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, mode);
        }
    }
    getCurrentToken() {
        const currentLogin = this.getProp("current_login") || "";
        const tokenProp = (this.getProp("token") || {});
        return {
            currentLogin,
            token: tokenProp[currentLogin]
        };
    }
    loadYamlOrJsonFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return new Error("FILE NOT FOUND");
        }
        const fileExt = path.extname(filePath);
        if (fileExt === ".json") {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        else if (fileExt === ".yml" || fileExt === ".yaml") {
            return this.loadYaml(filePath);
        }
        else if (fileExt === ".txt") {
            return fs.readFileSync(filePath, "utf8");
        }
        else {
            return new Error("UNSUPPORTED FILE TYPE");
        }
    }
    inquirerPrompt(questions) {
        return __awaiter(this, void 0, void 0, function* () {
            return inquirer.prompt(questions);
        });
    }
    wrapError(error) {
        let errorMessage;
        if (error.response && error.response.body && error.response.body.message) {
            errorMessage = error.response.body.message;
        }
        else {
            errorMessage = error.message;
        }
        return errorMessage;
    }
    difference(object, base) {
        function changes(object, base) {
            return _.transform(object, function (result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }
        return changes(object, base);
    }
    viewConfig() {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;
        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
            delete jsonProp.first_login;
        }
        else {
            jsonProp = ".katajson file not found";
        }
        console.log(jsonProp);
    }
}
exports.default = Helper;
//# sourceMappingURL=helper.js.map