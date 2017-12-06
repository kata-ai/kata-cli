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
const node_uuid_1 = require("node-uuid");
const colors = require("colors");
const inquirer = require("inquirer");
const repl = require("repl");
const util = require("util");
const deasync = require("deasync");
const Table = require("cli-table");
class Bot extends merapi_1.Component {
    constructor(compile, helper, tester, api) {
        super();
        this.compile = compile;
        this.helper = helper;
        this.tester = tester;
        this.api = api;
    }
    init(bot, name, version, options) {
        if (!version) {
            version = "0.0.1";
        }
        const botDesc = {
            schema: "kata.ai/schema/kata-ml/1.0",
            name,
            desc: "My First Bot",
            id: bot,
            version: version || "0.0.1",
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
        console.log(`Initialized ${name} successfully with id ${bot}`);
    }
    versions(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const botId = this.helper.getBotId();
                if (!botId) {
                    throw new Error("BOT ID HAS NOT DEFINED");
                }
                const { data, response } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, botId);
                if (data) {
                    console.log("Bot Versions : ");
                    data.versions.forEach((bot) => {
                        const msg = bot.split("-");
                        if (msg.length > 1) {
                            console.log(`- ${msg[0]} (${msg[1]})`);
                        }
                        else {
                            console.log(`- ${msg[0]}`);
                        }
                    });
                }
                else {
                    console.log("You must push at least 1 bot to acquire version");
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
            const botId = this.helper.getBotId();
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
    list(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, response } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsGet, {});
                const table = new Table({
                    head: ["Bot ID", "Bot Name", "Version", "Description"],
                    colWidths: [20, 20, 10, 20]
                });
                data.items.forEach((bot) => {
                    table.push([bot.id, bot.name, bot.version, bot.desc]);
                });
                console.log(table.toString());
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    update(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const desc = this.helper.loadYaml("./bot.yml");
            let [major, minor, patch] = desc.version.split(".").map((val) => parseInt(val));
            switch (options.rev) {
                case "major":
                    ++major;
                    minor = 0;
                    patch = 0;
                    break;
                case "minor":
                    ++minor;
                    patch = 0;
                    break;
                case "patch":
                    ++patch;
                    break;
            }
            if (major === undefined || minor === undefined || patch === undefined) {
                major = major || 0;
                minor = minor || 0;
                patch = patch || 0;
            }
            desc.version = `${major}.${minor}.${patch}`;
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
            if (!botDesc.id) {
                const id = node_uuid_1.v4();
                botDesc.id = id;
                desc.id = id;
                try {
                    const result = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsPost, botDesc);
                    console.log("BOT CREATED");
                }
                catch (e) {
                    console.log(this.helper.wrapError(e));
                }
            }
            else {
                try {
                    const result = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdPut, botDesc.id, botDesc, {});
                    desc.tag = "latest";
                    desc.version = result.data.version;
                    console.log("UPDATED BOT SUCCESSFULLY");
                }
                catch (e) {
                    const errorMessage = this.helper.wrapError(e);
                    if (errorMessage === "Bot not found.") {
                        const result = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsPost, botDesc);
                        desc.version = result.data.version;
                        console.log("CREATED BOT SUCCESSFULLY");
                    }
                    else {
                        console.log(errorMessage);
                    }
                }
            }
            this.helper.dumpYaml("./bot.yml", desc);
        });
    }
    discardDraft(botDesc, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                delete desc.tag;
                yield this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftDelete, botDesc.id);
                console.log("Draft discarded.");
            }
            catch (e) {
                this.helper.printError(e);
            }
            this.helper.dumpYaml("./bot.yml", desc);
        });
    }
    discard(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let desc = this.helper.loadYaml("./bot.yml");
            let bot = merapi_1.Config.create(desc, { left: "${", right: "}" });
            bot = this.compile.execDirectives(bot, process.cwd());
            bot.resolve();
            let botDesc = bot.get();
            if (options.draft) {
                yield this.discardDraft(botDesc, desc);
                return;
            }
            return;
        });
    }
    updateDraft(botDesc, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            botDesc.id = botDesc.id || node_uuid_1.v4();
            try {
                yield this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftPost, botDesc.id, botDesc);
                desc.tag = "draft";
                botDesc.tag = "draft";
                console.log("Draft updated.");
            }
            catch (e) {
                this.helper.printError(e);
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
            const botId = this.helper.getBotId();
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
        let currentSession = (options.session ? options.session : node_uuid_1.v4());
        const botDesc = this.helper.loadYaml("./bot.yml");
        const botId = botDesc.id;
        const defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";
        const con = repl.start({
            prompt: botDesc.name + ">",
            writer(obj) {
                return util.inspect(obj, false, null, true);
            }
        });
        con.context.text = function text(str) {
            const message = {
                type: "text",
                content: str
            };
            const body = {
                sessionId: currentSession,
                message
            };
            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));
                return data;
            }
            catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
        con.context.button = function button(op, obj = {}) {
            obj.op = op;
            const message = {
                type: "data",
                payload: obj
            };
            const body = {
                sessionId: currentSession,
                message
            };
            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));
                return data;
            }
            catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
        con.context.command = function button(command, obj = {}) {
            const message = {
                type: "command",
                content: command,
                payload: obj
            };
            const body = {
                sessionId: currentSession,
                message
            };
            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));
                return data;
            }
            catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
        con.context.current = function (session) {
            if (arguments.length) {
                currentSession = session;
            }
            else {
                return currentSession;
            }
        }.bind(this);
        con.context.session = function session(name, update) {
            try {
                if (!arguments.length) {
                    const res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, currentSession, "get"));
                    return res.data;
                }
                else if (arguments.length === 1) {
                    const res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, name, "get"));
                    return res.data;
                }
                else {
                    let res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, currentSession, "getOrCreate"));
                    const session = res.data;
                    res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut, botId, defaultDeploymentId, session.id, update));
                    return res.data;
                }
            }
            catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
        con.context.clear = function clear(name) {
            name = name || currentSession;
            try {
                const { data } = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, name, "get"));
                const session = Object.assign({}, data);
                if (session) {
                    this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete, botId, defaultDeploymentId, session.id));
                }
            }
            catch (e) {
                const errorMessage = this.helper.wrapError(e);
                if (errorMessage === "Session not found.") {
                    return;
                }
                return errorMessage;
            }
        }.bind(this);
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
}
exports.default = Bot;
//# sourceMappingURL=bot.js.map