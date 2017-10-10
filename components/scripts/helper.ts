
import { Component, JsonObject, Json, IConfig } from "merapi";

const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");

export default class Helper extends Component {

    constructor(private config: IConfig) {
        super();
    }

    getFiles(dir: string, ending: string) : string[] {
        let fileList = fs.readdirSync(dir);
        let res = [];
        for (let i=0; i<fileList.length; i++) {
            let stat = fs.statSync(path.resolve(dir, fileList[i]));
            if (stat.isDirectory()) {
                res.push(...this.getFiles(dir+"/"+fileList[i], ending));
            } else if(stat.isFile() && fileList[i].endsWith(ending)) {
                res.push(dir+"/"+fileList[i]);
            }
        }
        return res;
    };

    loadYaml(file: string) : JsonObject {
        return yaml.safeLoad(fs.readFileSync(file, "utf8"));
    };

    dumpYaml(file: string, object: JsonObject) : void {
        fs.writeFileSync(file, yaml.safeDump(object, { indent: 4, lineWidth: 150 }), "utf8");
    };

    compareTestResult(result: Json, expect: Json) : {field: string, expect: any, result: any}[] {
        if (!result) return null;
        let errors = [];
        let expected = this.config.create(expect).flatten();
        let res = this.config.create(result);
        for (let i in expected) {
            let value = res.get(i);
            if (value !== expected[i]) {
                errors.push({field: i, expect: expected[i], result: value});
            }
        }
        return errors;
    };

    setProp(prop: string, value: string, options?: JsonObject) : void {
        let jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath))
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        else
            jsonProp = {};

        jsonProp[prop] = value;

        fs.writeFileSync(jsonPath, JSON.stringify(jsonProp), "utf8");
    };

    getProp(prop: string, options?: JsonObject) : Json {
        let jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
        else {
            jsonProp = {};
        }

        return jsonProp[prop];
    }

    delete() : Boolean {
        let jsonPath = `${os.homedir()}/.katajson`;

        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            return true;
        }

        return false;
    }

    toPromise(ctx: any, func: any, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            args.push((error: Error, data: any, response: Response) => {
                if (error)
                    reject(error);
                else
                    resolve({data, response});
            });
            
            func.apply(ctx, args);
        });
    }

    getBotId() : string {
        let desc = this.loadYaml("./bot.yml");

        return <string>desc.id;
    }

    createDirectory(dirPath: string, mode?: number) {
        if (!fs.existsSync(dirPath))
            fs.mkdirSync(dirPath, mode);
    }

    getCurrentToken() : JsonObject {
        let currentLogin = <string> this.getProp("current_login") || "";
        let tokenProp = <JsonObject>(this.getProp("token") || {});

        return {
            currentLogin,
            token: tokenProp[currentLogin]
        };
    }

    loadYamlOrJsonFile(filePath: string) {
        if (!fs.existsSync(filePath))
            return new Error("FILE NOT FOUND");

        let fileExt = path.extname(filePath);

        if (fileExt === ".json") {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        else if (fileExt === ".yml" || fileExt === ".yaml") {
            return this.loadYaml(filePath);
        }
        else
            return new Error("UNSUPPORTED FILE TYPE");
    }

    async inquirerPrompt(questions: JsonObject[]): Promise<JsonObject> {
        return inquirer.prompt(questions);
    }

    wrapError(error : any) {
        let errorMessage;
        
        if (error.response && error.response.body && error.response.body.message)
            errorMessage = error.response.body.message;
        else
            errorMessage = error.message;
        
        console.log(errorMessage);
    }
};
