
import { Component, JsonObject, Json, IConfig } from "merapi";
import * as _ from "lodash";

const Catch = require("catch-decorator");
const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
const analytics = require('universal-analytics');

function wrapError(error: any) {
    let errorMessage;

    if (error.response && error.response.body && error.response.body.message) {
        errorMessage = error.response.body.message;
    } else if (error.response && error.response.body) {
        errorMessage = error.response.body;
    } else {
        errorMessage = error.message;
    }

    return errorMessage;
}

export const CatchError = Catch(Error, (error: any) => {
    console.log("Error");
    console.error(wrapError(error));
});


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

    public deleteKeyToken(userName: string) {
        const jsonPath = `${os.homedir()}/.katajson`;
        let jsonProp;

        if (fs.existsSync(jsonPath)) {
            jsonProp = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
            // if userName token exist 
            if (userName in jsonProp.token) {
                jsonProp.current_login = "admin";
                delete jsonProp.token[userName];
                delete jsonProp.projectId;
                delete jsonProp.projectName;
            } else {
                return new Error(`Failed to unimpersonate ${(userName)}`);
            }
        } else {
            jsonProp = {};
        }
        fs.writeFileSync(jsonPath, JSON.stringify(jsonProp), "utf8");
        return jsonProp;
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

    public getProjectId(): string {
        return this.getProp("projectId") as string;
    }

    public createDirectory(dirPath: string, mode?: number) {
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

    public wrapError(error: any) {
        const errorMessage: string = wrapError(error);

        const commands: JsonObject[] = this.getCommandSession();
        // Note: error might happen even after clearCommandSession is called
        // this might results in an empty command, we do not want to track empty command error
        if (commands.length > 0) {
          const lastCommand: string = commands[commands.length - 1].command as string;
          const mainCommand: string = lastCommand.split(" ")[0];

          this.sendGoogleAnalytics("debug", mainCommand, lastCommand, commands, errorMessage);
          this.clearCommandSession();
        }

        return errorMessage;
    }

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

    public checkNotificationStatus(): Boolean {
        const jsonPath = `${os.homedir()}/.katanotif`;

        if (fs.existsSync(jsonPath)) {
            return true
        } else {
            fs.writeFileSync(jsonPath, "true", "utf8");
            return false
        }
    }

    public addCommandSession(command:string): void {
        const jsonPath = `${os.homedir()}/.katacommand`;
        let jsonData:JsonObject[] = [];

        if (fs.existsSync(jsonPath)) jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        if (jsonData.length > 0) {
            const lastData:JsonObject = jsonData[jsonData.length - 1]
            const diff:number = Math.abs(Number(lastData.timestamp) - new Date().getTime()) / 36e5;
            
            if (diff >= 1) jsonData = [] //Lebih dari 1 jam ?
        }

        jsonData.push({ timestamp: new Date().getTime(), command: command })

        fs.writeFileSync(jsonPath, JSON.stringify(jsonData), "utf8");
    }

    public getCommandSession(): JsonObject[] {
        const jsonPath = `${os.homedir()}/.katacommand`;
        let jsonData:JsonObject[] = [];

        if (fs.existsSync(jsonPath)) jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        return jsonData
    }

    public clearCommandSession(): void {
        const jsonPath = `${os.homedir()}/.katacommand`;

        fs.writeFileSync(jsonPath, "[]", "utf8");
    }

    public sendGoogleAnalytics(event:string, action:string, command:string, lastSession?:JsonObject[], errorMessage?:string): void {
        let firstLogin = this.getProp("first_login") as JsonObject;
        let projectId = this.getProp("projectId") as string;
        let projectName = this.getProp("projectName") as string;

        if (!firstLogin) firstLogin = { id: null, username: null, type: null }
        if (!projectId) projectId = null
        if (!projectName) projectName = null

        const version = this.config.default("version", "1.0.0")
        const google = analytics(this.config.default('config.trackingId', 'UA-131926842-1'), firstLogin.id);

        const data:JsonObject = {
            userId: firstLogin.id,
            username: firstLogin.username,
            currentUserType: firstLogin.type,
            activeProjectId: projectId,
            activeProjectName: projectName,
            command: command,
            versionCLI: version,
            timestamp: new Date().getTime()
        }

        if (lastSession) data.lastSession = lastSession
        if (errorMessage) data.errorMessage = errorMessage

        google.event(event, action, JSON.stringify(data), (err:any) => {
            if (err) console.log(this.wrapError(err));
        })
    }
}
