
import { IConfig, IHash, Component } from "merapi";
import { ICompile, IHelper } from "interfaces/main";

const { Config } = require("merapi");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

export default class Compile extends Component implements ICompile {
    private directives : any = {
        include(file: string, basepath: string, helper: IHelper) {
            let ext = path.extname(file);
            if (ext === ".yml" || ext === ".yaml")
                return helper.loadYaml(path.resolve(basepath, file));
            else if(ext === ".json")
                return require(path.resolve(basepath, file));
            else
                return fs.readFileSync(path.resolve(basepath, file)).toString();
        }
    };

    constructor(private helper: IHelper) {
        super();
    }

    execDirective(name : string, directive: any, dict : IHash<any>, basepath : string) {
        for (let i in dict) {
            if (typeof dict[i] !== "string")
                continue;
            let val = dict[i].trim();
            if (val.indexOf("$"+name+"(") === 0 && val.charAt(val.length-1) === ")") {
                dict[i] = directive(dict[i].substring(2+name.length, dict[i].length-1), basepath, this.helper);
            }
        }
    }

    execDirectives(config : IConfig, basepath : string) : IConfig {
        let flattened = config.flatten();
        for (let i in this.directives) {
            this.execDirective(i, this.directives[i], flattened, basepath);
        }
        return config.create(flattened);
    }
}