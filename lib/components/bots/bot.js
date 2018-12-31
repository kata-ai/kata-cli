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
const uuid_1 = require("uuid");
const colors = require("colors");
const repl = require("repl");
const util = require("util");
const Table = require("cli-table");
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
            let latestBotRevision;
            // get bot latestRevision
            // TODO: find a better way to get the latest bot revision
            try {
                const { response: { body: data } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdBotGet, projectId);
                if (data.revision) {
                    latestBotRevision = data.revision;
                }
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
            try {
                botDesc.id = projectId;
                const result = yield this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsRevisionPut, projectId, latestBotRevision, botDesc);
                console.log(`Push Bot Success. Revision : ${result.data.revision.substring(0, 7)}`);
            }
            catch (e) {
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
                session: currentSession,
                message
            };
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
                session: currentSession,
                message
            };
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
                session: currentSession,
                message
            };
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
}
exports.default = Bot;
//# sourceMappingURL=bot.js.map