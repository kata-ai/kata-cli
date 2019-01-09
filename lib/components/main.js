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
const analytics = require('universal-analytics');
class Main extends merapi_1.Component {
    constructor(config, injector, helper) {
        super();
        this.config = config;
        this.injector = injector;
        this.helper = helper;
        this.google = analytics(this.config.default('config.trackingId', 'UA-131926842-1'));
    }
    start(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            let commands = this.config.get("commands");
            commander.version(`Kata CLI version ${this.config.default("version", "1.0.0")}`);
            yield this.compile(commands, commander);
            commander.parse(argv);
            const validCommands = commander.commands.map((x) => x.name());
            if (argv.length === 2 || validCommands.indexOf(argv[2]) === -1) {
                commander.parse([argv[0], argv[1], '-h']);
            }
            this.sendNotificationTracking();
            this.sendDataAnalytics(argv);
            this.saveCommandSession(argv);
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
    sendDataAnalytics(argv) {
        const command = Object.assign([], argv);
        let firstLogin = this.helper.getProp("first_login");
        let projectId = this.helper.getProp("projectId");
        let projectName = this.helper.getProp("projectName");
        const version = this.config.default("version", "1.0.0");
        if (!firstLogin)
            firstLogin = { id: null, username: null, type: null };
        if (!projectId)
            projectId = null;
        if (!projectName)
            projectName = null;
        const data = {
            userId: firstLogin.id,
            username: firstLogin.username,
            currentUserType: firstLogin.type,
            activeProjectId: projectId,
            activeProjectName: projectName,
            command: command.splice(2).join(' '),
            versionCLI: version,
            timestamp: new Date().getTime()
        };
        this.google.event('commands', 'track', JSON.stringify(data), (err) => {
            if (err)
                console.log(this.helper.wrapError(err));
        });
    }
    sendNotificationTracking() {
        const status = this.helper.checkNotificationStatus();
        if (!status)
            console.log(`\nStarting from Kata CLI v${this.config.default("version", "1.0.0")}, we added analytics to Kata CLI that will collect usage data every time you typed a command. To learn about what we collect and how we use it, visit https://privacy.kata.ai/kata-cli-analytics\n`);
    }
    saveCommandSession(argv) {
        const command = Object.assign([], argv);
        this.helper.addCommandSession(command.splice(2).join(' '));
    }
}
exports.default = Main;
//# sourceMappingURL=main.js.map