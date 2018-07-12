
import { Component, JsonObject, Json, IConfig } from "merapi";
import * as _ from "lodash";

const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");

export default class Helper extends Component {

    constructor(private config : IConfig) {
        super();
    }

    public getFiles(dir : string, ending : string) : string[] {
        const fileList = fs.readdirSync(dir);
        const res = [];
        for (let i = 0; i < fileList.length; i++) {
            const stat = fs.statSync(path.resolve(dir, fileList[i]));
            if (stat.isDirectory()) {
                res.push(...this.getFiles(dir + "/" + fileList[i], ending));
            } else if (stat.isFile() && fileList[i].endsWith(ending)) {
                res.push(dir + "/" + fileList[i]);
            }
        }
        return res;
    }

    public loadYaml(file : string) : JsonObject {
        return yaml.safeLoad(fs.readFileSync(file, "utf8"));
    }

    public dumpYaml(file : string, object : JsonObject) : void {
        fs.writeFileSync(file, yaml.safeDump(object, { indent: 4, lineWidth: 150 }), "utf8");
    }

    public compareTestResult(result : Json, expect : Json) : { field : string, expect : any, result : any }[] {
        if (!result) { return null; }
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

    public setProp(prop : string, value : string, options? : JsonObject) : void {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        } else {
            jsonProp = {};
        }

        jsonProp[prop] = value;

        fs.writeFileSync(jsonPath, JSON.stringify(jsonProp), "utf8");
    }

    public getProp(prop : string, options? : JsonObject) : Json {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        } else {
            jsonProp = {};
        }

        return jsonProp[prop];
    }

    public delete() : Boolean {
        const jsonPath = `${os.homedir()}/.katajson`;

        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            return true;
        }

        return false;
    }

    public toPromise(ctx : any, func : any, ...args : any[]) : Promise<any> {
        return new Promise((resolve, reject) => {
            args.push((error : Error, data : any, response : Response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ data, response });
                }
            });

            func.apply(ctx, args);
        });
    }

    public getBotId() : string {
        const desc = this.loadYaml("./bot.yml");

        return desc.id as string;
    }

    public createDirectory(dirPath : string, mode? : number) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, mode);
        }
    }

    public getCurrentToken() : JsonObject {
        const currentLogin = this.getProp("current_login") as string || "";
        const tokenProp = (this.getProp("token") || {}) as JsonObject;

        return {
            currentLogin,
            token: tokenProp[currentLogin]
        };
    }

    public loadYamlOrJsonFile(filePath : string) {
        if (!fs.existsSync(filePath)) {
            return new Error("FILE NOT FOUND");
        }

        const fileExt = path.extname(filePath);

        if (fileExt === ".json") {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        } else if (fileExt === ".yml" || fileExt === ".yaml") {
            return this.loadYaml(filePath);
        } else if (fileExt === ".txt") {
            return fs.readFileSync(filePath, "utf8");
        } else {
            return new Error("UNSUPPORTED FILE TYPE");
        }
    }

    public async inquirerPrompt(questions : JsonObject[]) : Promise<JsonObject> {
        return inquirer.prompt(questions);
    }

    public wrapError(error : any) {
        let errorMessage;

        if (error.response && error.response.body && error.response.body.message) {
            errorMessage = error.response.body.message;
        } else {
            errorMessage = error.message;
        }

        return errorMessage;
    }

    public printError = (error : any) => console.error(this.wrapError(error));

    public difference(object : any, base : any) {
        function changes(object : any, base : any) {
            return _.transform(object, function(result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(object, base);
    }

    public viewConfig() : void {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
            delete jsonProp.first_login;
        } else {
            jsonProp = ".katajson file not found";
        }

        console.log(jsonProp);
    }
}
