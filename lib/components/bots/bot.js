"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const uuid_1 = require("uuid");
const helper_1 = require("../scripts/helper");
const util_1 = require("util");
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors");
const repl = require("repl");
const util = require("util");
const os = require("os");
const fs = require("fs");
const deasync = require("deasync");
class Bot extends merapi_1.Component {
    constructor(compile, helper, tester, api) {
        super();
        this.compile = compile;
        this.helper = helper;
        this.tester = tester;
        this.api = api;
    }
    init(name, options) {
        const botDesc = {
            schema: "kata.ai/schema/kata-ml/1.0",
            name,
            desc: "My First Bot",
            flows: {
                hello: {
                    fallback: true,
                    intents: {
                        greeting: {
                            initial: true,
                            condition: "content == 'hi'"
                        },
                        fallback: {
                            fallback: true
                        }
                    },
                    states: {
                        init: {
                            initial: true,
                            transitions: {
                                greet: {
                                    condition: "intent == \"greeting\""
                                },
                                other: {
                                    fallback: true
                                }
                            }
                        },
                        greet: {
                            end: true,
                            action: {
                                name: "text",
                                options: {
                                    text: "hi!"
                                }
                            }
                        },
                        other: {
                            end: true,
                            action: {
                                name: "text",
                                options: {
                                    text: "sorry!"
                                }
                            }
                        }
                    }
                }
            }
        };
        this.helper.dumpYaml("./bot.yml", botDesc);
        console.log(`Initialized ${name} successfully`);
    }
    revisions(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectId = this.getProject();
                const { data, response } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsGet, projectId);
                const result = data;
                if (result && result.data) {
                    console.log("Bot Revision : ");
                    result.data.forEach((hist) => {
                        console.log(`- ${hist.revision}`);
                    });
                }
                else {
                    console.log("You must push at least 1 bot to acquire revisions");
                }
            }
            catch (e) {
                if (e.code === "ENOENT") {
                    console.log("kata versions must be executed in bot directory with bot.yml");
                }
                else {
                    console.log(this.helper.wrapError(e));
                }
            }
        });
    }
    test(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const testFiles = file ? [file] : this.helper.getFiles("./test", ".spec.yml");
            const botId = this.helper.getProjectId();
            if (!botId) {
                throw new Error("BOT ID HAS NOT DEFINED");
            }
            const results = {};
            for (let i = 0; i < testFiles.length; i++) {
                const yaml = this.helper.loadYaml(testFiles[i]);
                let res;
                switch (yaml.schema) {
                    case "kata.ai/schema/kata-ml/1.0/test/intents":
                        res = yield this.tester.execIntentTest(yaml, this.api.botApi, botId, console.log);
                        if (this.hasErrors(res)) {
                            results[testFiles[i]] = res;
                        }
                        break;
                    case "kata.ai/schema/kata-ml/1.0/test/states":
                        res = yield this.tester.execStateTest(yaml, this.api.botApi, botId, console.log);
                        if (this.hasErrors(res)) {
                            results[testFiles[i]] = res;
                        }
                        break;
                    case "kata.ai/schema/kata-ml/1.0/test/actions":
                        res = yield this.tester.execActionsTest(yaml, this.api.botApi, botId, console.log);
                        if (this.hasErrors(res)) {
                            results[testFiles[i]] = res;
                        }
                        break;
                    case "kata.ai/schema/kata-ml/1.0/test/flow":
                        res = yield this.tester.execFlowTest(yaml, this.api.botApi, botId, console.log);
                        if (this.hasErrors(res)) {
                            results[testFiles[i]] = res;
                        }
                        break;
                }
            }
            this.printResult(results);
        });
    }
    hasErrors(res) {
        return Object.keys(res).some((key) => (res[key] && res[key].length) || res[key] === null);
    }
    printResult(results = {}) {
        if (Object.keys(results).length) {
            console.log(colors.red("Errors:"));
            for (const i in results) {
                console.log(`    ${i}:`);
                for (const j in results[i]) {
                    if (!results[i][j]) {
                        console.log(`        ${colors.red(j + ":")}`);
                        console.log(`            diaenne returns ${colors.red("null")}`);
                        continue;
                    }
                    if (results[i][j].length) {
                        console.log(`        ${colors.red(j + ":")}`);
                        results[i][j].forEach((res) => {
                            console.log(`            expecting ${res.field} to be ${colors.green(res.expect)} but got ${colors.red(res.result)}`);
                        });
                    }
                }
            }
        }
    }
    push(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const desc = this.helper.loadYaml("./bot.yml");
            desc.tag = options.tag || null;
            let bot = merapi_1.Config.create(desc, { left: "${", right: "}" });
            bot = this.compile.execDirectives(bot, process.cwd());
            bot.resolve();
            const botDesc = bot.get();
            botDesc.name = botDesc.name || "bot";
            if (options.draft) {
                yield this.updateDraft(botDesc, desc);
                return;
            }
            const projectId = this.getProject();
            botDesc.id = projectId;
            let latestBotRevision;
            try {
                const { response: { body: data } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdBotGet, botDesc.id);
                if (data.revision) {
                    latestBotRevision = data.revision;
                    const { data: newBot } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsRevisionPut, projectId, latestBotRevision, botDesc);
                    const { data: project } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdGet, projectId);
                    console.log(`Updated bot ${colors.green(project.name)} with revision: ${newBot.revision.substring(0, 7)}`);
                }
                else {
                    throw Error("Could not find latest bot revision from this project.");
                }
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
            this.helper.dumpYaml("./bot.yml", desc);
        });
    }
    discardDraft(botDesc, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                desc.tag = null;
                yield this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftDelete, botDesc.id);
                console.log("Draft discarded.");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
            this.helper.dumpYaml("./bot.yml", desc);
        });
    }
    discard(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const desc = this.helper.loadYaml("./bot.yml");
            let bot = merapi_1.Config.create(desc, { left: "${", right: "}" });
            bot = this.compile.execDirectives(bot, process.cwd());
            bot.resolve();
            const botDesc = bot.get();
            if (options.draft) {
                yield this.discardDraft(botDesc, desc);
                return;
            }
            return;
        });
    }
    updateDraft(botDesc, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            botDesc.id = botDesc.id || uuid_1.v4();
            try {
                yield this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftPost, botDesc.id, botDesc);
                desc.tag = "draft";
                botDesc.tag = "draft";
                console.log("Draft updated.");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
            this.helper.dumpYaml("./bot.yml", desc);
        });
    }
    delete(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const answer = yield this.helper.inquirerPrompt([
                {
                    type: "confirm",
                    name: "confirmation",
                    message: "Are you sure to delete this bot?",
                    default: false
                }
            ]);
            if (!answer.confirmation) {
                return;
            }
            const botId = this.helper.getProjectId();
            try {
                const { data } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdDelete, botId);
                console.log("REMOVE BOT SUCCESSFULLY");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    console(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let projectId;
            let botDesc;
            try {
                projectId = this.getProject();
                botDesc = this.helper.loadYaml("./bot.yml");
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
                return;
            }
            const dataEnvironments = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, null);
            const environments = dataEnvironments.response.body.data;
            const choicesEnvironment = environments.map((environment) => ({ name: environment.name, value: environment.name }));
            choicesEnvironment.push({ name: 'No Environment', value: null });
            let { environment } = yield inquirer.prompt([
                {
                    type: "list",
                    name: "environment",
                    message: "Environment:",
                    choices: choicesEnvironment
                }
            ]);
            const con = repl.start({
                prompt: botDesc.name + ">",
                writer(obj) {
                    return util.inspect(obj, false, null, true);
                }
            });
            con.context.text = function text(str) {
                let currentSession = this.getLocalSession();
                const message = {
                    type: "text",
                    content: str
                };
                const body = {
                    environmentName: environment,
                    session: currentSession,
                    message
                };
                if (!body.environmentName)
                    delete body.environmentName;
                try {
                    return this.converse(projectId, body);
                }
                catch (e) {
                    return this.helper.wrapError(e);
                }
            }.bind(this);
            con.context.button = function button(op, obj = {}) {
                let currentSession = this.getLocalSession();
                obj.op = op;
                const message = {
                    type: "data",
                    payload: obj
                };
                const body = {
                    environmentName: environment,
                    session: currentSession,
                    message
                };
                if (!body.environmentName)
                    delete body.environmentName;
                try {
                    return this.converse(projectId, body);
                }
                catch (e) {
                    return this.helper.wrapError(e);
                }
            }.bind(this);
            con.context.command = function command(command, obj = {}) {
                let currentSession = this.getLocalSession();
                const message = {
                    type: "command",
                    content: command,
                    payload: obj
                };
                const body = {
                    environmentName: environment,
                    session: currentSession,
                    message
                };
                if (!body.environmentName)
                    delete body.environmentName;
                try {
                    return this.converse(projectId, body);
                }
                catch (e) {
                    return this.helper.wrapError(e);
                }
            }.bind(this);
            con.context.current = () => this.getLocalSession();
            con.context.clear = () => this.resetSession();
            con.context.clearCaches = function clearCaches(num = 20) {
                try {
                    for (let i = 0; i < num; i++) {
                        this.sync(this.helper.toPromise(this.api.cachesApi, this.api.cachesApi.cachesDelete));
                    }
                }
                catch (e) {
                    return this.helper.wrapError(e);
                }
            }.bind(this);
        });
    }
    sync(promise) {
        if (promise && typeof promise.then === "function") {
            let done = false;
            let error = null;
            let result;
            promise.then((res) => {
                done = true;
                result = res;
            }).catch((e) => {
                error = e;
            });
            deasync.loopWhile(() => {
                return !done && !error;
            });
            if (error) {
                throw error;
            }
            return result;
        }
        throw new Error("Sync only accept promises");
    }
    pull(revision, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let projectId;
            let bots;
            let botDesc;
            try {
                projectId = this.getProject();
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
                return;
            }
            try {
                const { response: { body } } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsGet, projectId);
                bots = body.data;
            }
            catch (e) {
                console.log("INVALID PROJECT");
                return;
            }
            try {
                if (!revision) {
                    revision = bots[0].revision;
                }
                const { response: { body } } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsRevisionGet, projectId, revision);
                botDesc = body;
            }
            catch (e) {
                console.log("INVALID PROJECT REVISION");
                return;
            }
            // remove data
            delete botDesc.id;
            delete botDesc.revision;
            delete botDesc.changelog;
            for (const flow in botDesc.flows) {
                if (botDesc.flows[flow]) {
                    for (const state in botDesc.flows[flow].states) {
                        if (botDesc.flows[flow].states[state]) {
                            delete botDesc.flows[flow].states[state].style;
                        }
                    }
                }
            }
            console.log(`Pull bot revision ${revision.substring(0, 6)} to bot.yml`);
            this.helper.dumpYaml("./bot.yml", botDesc);
            return;
        });
    }
    getProject() {
        const projectId = this.helper.getProp("projectId");
        if (!projectId || projectId === "") {
            throw Error("Error : You must specify a Project first, execute kata list-project to list your projects.");
        }
        return projectId;
    }
    converse(projectId, body) {
        const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotConversePost, projectId, body));
        const { session } = data;
        this.setLocalSession(session);
        return data;
    }
    setLocalSession(session) {
        const jsonPath = `${os.homedir()}/.katasession`;
        try {
            if (session) {
                fs.writeFileSync(jsonPath, JSON.stringify(session), "utf8");
            }
        }
        catch (error) {
            console.log(this.helper.wrapError(`Error set local session : ${error.message}`));
        }
    }
    getLocalSession() {
        const jsonPath = `${os.homedir()}/.katasession`;
        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
        else {
            // default session
            return {
                "channel_id": "console-channel",
                "environment_id": "console-environment",
                "states": {},
                "contexes": {},
                "history": [],
                "current": null,
                "meta": null,
                "timestamp": Date.now(),
                "data": {},
                "created_at": Date.now(),
                "updated_at": Date.now(),
                "session_start": Date.now(),
                "session_id": "test~from~console",
                "id": "test~from~console"
            };
        }
    }
    resetSession() {
        const jsonPath = `${os.homedir()}/.katasession`;
        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            return true;
        }
    }
    errors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectId = this.helper.getProp("projectId");
                if (projectId) {
                    const dataEnvironments = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, null);
                    if (dataEnvironments && dataEnvironments.response && dataEnvironments.response.body && dataEnvironments.response.body.data && dataEnvironments.response.body.data.length > 0) {
                        const environments = dataEnvironments.response.body.data;
                        const choicesEnvironment = environments.map((environment) => ({
                            name: environment.name,
                            value: environment.id
                        }));
                        let { environmentId } = yield inquirer.prompt([
                            {
                                type: "list",
                                name: "environmentId",
                                message: "Environment:",
                                choices: choicesEnvironment
                            }
                        ]);
                        const dataChannels = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet, projectId, environmentId, null);
                        const channels = dataChannels.response.body;
                        const choicesChannel = channels.map((channel) => ({
                            name: channel.name,
                            value: channel.id
                        }));
                        let { channelId } = yield inquirer.prompt([
                            {
                                type: "list",
                                name: "channelId",
                                message: "Channel:",
                                choices: choicesChannel
                            }
                        ]);
                        let { start, end, error } = yield inquirer.prompt([
                            {
                                type: "text",
                                name: "start",
                                message: "Date Start (yyyy-mm-dd):"
                            },
                            {
                                type: "text",
                                name: "end",
                                message: "Date End (yyyy-mm-dd):"
                            },
                            {
                                type: "list",
                                name: "error",
                                message: "Error Group:",
                                choices: [
                                    {
                                        name: "User Error",
                                        value: { "group": 1000, "code": "1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100" }
                                    },
                                    {
                                        name: "System Error",
                                        value: { "group": 4000, "code": "4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4051,4052,4053,4054,4055,4056,4057,4058,4059,4060,4061,4062,4063,4064,4065,4066,4067,4068,4069,4070,4071,4072,4073,4074,4075,4076,4077,4078,4079,4080,4081,4082,4083,4084,4085,4086,4087,4088,4089,4090,4091,4092,4093,4094,4095,4096,4097,4098,4099,4100" }
                                    }
                                ]
                            },
                        ]);
                        if (util_1.isDate(start) == false) {
                            start = new Date().setHours(0, 0, 0);
                        }
                        else {
                            start = new Date(start).setHours(0, 0, 0);
                        }
                        if (util_1.isDate(end) == false) {
                            end = new Date().setHours(23, 59, 59);
                        }
                        else {
                            end = new Date(end).setHours(23, 59, 59);
                        }
                        const errorGroup = error.group;
                        const errorCode = error.code;
                        const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdErrorsGet, projectId, environmentId, channelId, errorGroup, errorCode, new Date(start).toISOString(), new Date(end).toISOString());
                        if (response && response.body && response.body.data) {
                            const table = new Table({
                                head: ["Time", "Error Code", "Error Message"],
                                colWidths: [25, 15, 75]
                            });
                            response.body.data.forEach((project) => {
                                table.push([project.timestamp, project.errorCode, project.errorMessage]);
                            });
                            console.log(table.toString());
                        }
                    }
                    else {
                        console.log("Failed to get Environment list");
                    }
                }
                else {
                    console.log("Please select Project first");
                }
            }
            catch (e) {
                console.error(this.helper.wrapError(e));
            }
        });
    }
}
__decorate([
    helper_1.CatchError,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Bot.prototype, "push", null);
exports.default = Bot;
//# sourceMappingURL=bot.js.map