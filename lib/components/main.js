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
const commander = require("commander");
class Main extends merapi_1.Component {
    constructor(config, injector) {
        super();
        this.config = config;
        this.injector = injector;
    }
    start(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            let commands = this.config.get("commands");
            yield this.compile(commands, commander);
            commander.parse(argv);
        });
    }
    compile(commands, program, currKey = "") {
        return __awaiter(this, void 0, void 0, function* () {
            for (let key in commands) {
                let command = commands[key];
                if (command.type === "group") {
                    yield this.compileGroup(`${currKey}${key}`, command, program);
                }
                else if (command.type === "alias") {
                    this.compileAlias(key, command, program);
                }
                else {
                    yield this.compileCommand(`${currKey}${key}`, command, program);
                }
            }
        });
    }
    compileGroup(key, command, program) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.compile(command.subcommands, program, `${key}-`);
        });
    }
    compileAlias(key, command, program) {
        program.command(key).action((self) => {
            let args = self._args;
            commander.parse(command.alias.split(/\s+/).concat(args));
        });
    }
    compileCommand(key, command, program) {
        return __awaiter(this, void 0, void 0, function* () {
            let subcommand;
            let commandKey = command.alias ? command.alias : key;
            if (command.args) {
                subcommand = program.command(`${commandKey} ${command.args}`);
            }
            else {
                subcommand = program.command(commandKey);
            }
            if (command.params) {
                for (let i in command.params) {
                    let param = command.params[i];
                    let flag = param.short ? `-${param.short}, --${i}` : `--${i}`;
                    if (param.value !== undefined)
                        subcommand.option(`${flag} <value>`, param.desc || "", param.value);
                    else if (param.bool)
                        subcommand.option(flag, param.desc || "");
                    else
                        subcommand.option(`${flag} [value]`, param.desc || "");
                }
            }
            subcommand.action(yield this.createAction(command.handler, command.middleware));
        });
    }
    createAction(handler, middleware = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let methods = [];
            for (let i = 0; i < middleware.length; i++) {
                methods.push(yield this.injector.resolveMethod(middleware[i]));
            }
            let handlerMethod = yield this.injector.resolveMethod(handler);
            return (...args) => {
                for (let i = 0; i < methods.length; i++)
                    args = methods[i](...args);
                handlerMethod(...args);
            };
        });
    }
}
exports.default = Main;
//# sourceMappingURL=main.js.map