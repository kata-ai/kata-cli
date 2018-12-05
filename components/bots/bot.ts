
import { ICompile, IHelper, ITester } from "interfaces/main";
import { Component, Config, IHash, JsonObject } from "merapi";
import { v4 as uuid } from "uuid";

const colors = require("colors");
const repl = require("repl");
const util = require("util");
const Table = require("cli-table");
const os = require("os");
const fs = require("fs");
const deasync = require("deasync");

export default class Bot extends Component {
    constructor(private compile: ICompile, private helper: IHelper, private tester: ITester, private api: any) {
        super();
    }

    public init(name: string, options: JsonObject) {
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

    public async revisions(options: JsonObject) {
        try {
            const projectId = this.getProject();
            const { data, response } = await this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsGet, projectId);
            const result = data;
            if (result && result.data) {
                console.log("Bot Revision : ");
                result.data.forEach((hist: JsonObject) => {
                    console.log(`- ${hist.revision}`);
                });
            } else {
                console.log("You must push at least 1 bot to acquire revisions");
            }
        } catch (e) {
            if (e.code === "ENOENT") {
                console.log("kata versions must be executed in bot directory with bot.yml");
            } else {
                console.log(this.helper.wrapError(e));
            }
        }
    }

    public async test(file: string, options: JsonObject) {
        const testFiles = file ? [file] : this.helper.getFiles("./test", ".spec.yml");
        const botId = this.helper.getProjectId();

        if (!botId) {
            throw new Error("BOT ID HAS NOT DEFINED");
        }

        const results: JsonObject = {};

        for (let i = 0; i < testFiles.length; i++) {
            const yaml = this.helper.loadYaml(testFiles[i]);
            let res;

            switch (yaml.schema) {
                case "kata.ai/schema/kata-ml/1.0/test/intents":
                    res = await this.tester.execIntentTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/states":
                    res = await this.tester.execStateTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/actions":
                    res = await this.tester.execActionsTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/flow":
                    res = await this.tester.execFlowTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
            }
        }

        this.printResult(results as IHash<IHash<{ field: string, expect: string, result: string }[]>>);
    }

    private hasErrors(res: any) {
        return Object.keys(res).some((key) => (res[key] && res[key].length) || res[key] === null);
    }

    private printResult(results: IHash<IHash<{ field: string, expect: string, result: string }[]>> = {}) {
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

    public async push(options: JsonObject) {
        const desc = this.helper.loadYaml("./bot.yml");
        desc.tag = options.tag || null;

        let bot = Config.create(desc, { left: "${", right: "}" });
        bot = this.compile.execDirectives(bot, process.cwd());
        bot.resolve();

        const botDesc = bot.get();
        botDesc.name = botDesc.name || "bot";

        if (options.draft) {
            await this.updateDraft(botDesc, desc);
            return;
        }

        try {
            const projectId = this.getProject();
            botDesc.id = projectId;
            const result = await this.helper.toPromise(this.api.botApi,
                this.api.botApi.projectsProjectIdBotRevisionsPost, projectId, botDesc);
            console.log(`Push Bot Success. Revision : ${result.data.revision.substring(0, 7)}`);
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }

        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async discardDraft(botDesc: JsonObject, desc: JsonObject): Promise<void> {
        try {
            desc.tag = null;
            await this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftDelete, botDesc.id);
            console.log("Draft discarded.");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async discard(options: JsonObject): Promise<void> {
        const desc = this.helper.loadYaml("./bot.yml");

        let bot = Config.create(desc, { left: "${", right: "}" });
        bot = this.compile.execDirectives(bot, process.cwd());
        bot.resolve();

        const botDesc = bot.get();

        if (options.draft) {
            await this.discardDraft(botDesc, desc);
            return;
        }
        return;
    }

    public async updateDraft(botDesc: JsonObject, desc: JsonObject): Promise<void> {
        botDesc.id = botDesc.id || uuid();

        try {
            await this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftPost, botDesc.id, botDesc);
            desc.tag = "draft";
            botDesc.tag = "draft";
            console.log("Draft updated.");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }

        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async delete(options: JsonObject) {
        const answer = await this.helper.inquirerPrompt([
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
            const { data } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdDelete, botId);

            console.log("REMOVE BOT SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public console(options: JsonObject) {
        let projectId: string;
        let botDesc;
        try {
            projectId = this.getProject() as string;
            botDesc = this.helper.loadYaml("./bot.yml");
        } catch (error) {
            console.log(this.helper.wrapError(error));
            return;
        }

        const con = repl.start({
            prompt: botDesc.name + ">",
            writer(obj: any) {
                return util.inspect(obj, false, null, true);
            }
        });

        con.context.text = function text(str: string) {
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
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.button = function button(op: JsonObject, obj: JsonObject = {}) {
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
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.command = function command(command: string, obj: JsonObject = {}) {
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
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.current = () => this.getLocalSession();
        con.context.clear = () => this.resetSession();

        con.context.clearCaches = function clearCaches(num: number = 20) {
            try {
                for (let i = 0; i < num; i++) {
                    this.sync(this.helper.toPromise(this.api.cachesApi, this.api.cachesApi.cachesDelete));
                }
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
    }

    private sync(promise: any) {
        if (promise && typeof promise.then === "function") {
            let done = false;
            let error: Error = null;
            let result;

            promise.then((res: any) => {
                done = true;
                result = res;
            }).catch((e: Error) => {
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

    public async pull(name: string, version: string, options: JsonObject) {
        let isGettingBot = false;
        try {
            const { data, response } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsGet, {});
            let found = false;
            let selectedBot: any;
            for (const bot of data.items) {
                const botName = bot.name;
                if (botName === name) {
                    found = true;
                    selectedBot = bot;
                    break;
                }
            }
            if (found) {
                // Get specific bot version
                isGettingBot = true;
                const botId = selectedBot.id + ":" + version;
                const getBot = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdGet, botId);
                const botDesc = getBot.data;
                this.helper.dumpYaml("./bot.yml", botDesc);
                console.log(`SUCCESS PULL BOT ${name} WITH VERSION ${version}`);
            } else {
                console.log(`BOT NOT FOUND`);
            }
        } catch (e) {
            if (isGettingBot) {
                console.log(`CANNOT PULL BOT ${name} WITH VERSION ${version}`);
            } else {
                console.log(this.helper.wrapError(e));
            }
        }
    }

    private getProject() {
        const projectId = this.helper.getProp("projectId")

        if (!projectId || projectId === "") {
            throw Error("Error : You must specify a Project first, execute kata list-project to list your projects.");
        }

        return projectId;
    }

    private converse(projectId: string, body: Object) {
        const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.projectsProjectIdBotConversePost, projectId, body)) as any;
        const { session } = data;
        this.setLocalSession(session);
        return data;
    }

    private setLocalSession(session: Object) {
        const jsonPath = `${os.homedir()}/.katasession`;
        try {
            if (session) {
                fs.writeFileSync(jsonPath, JSON.stringify(session), "utf8");
            }
        } catch (error) {
            console.log(this.helper.wrapError(`Error set local session : ${error.message}`));
        }

    }

    private getLocalSession() {
        const jsonPath = `${os.homedir()}/.katasession`;

        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        } else {
            // default session
            return {
                "channel_id" : "console-channel",
                "environment_id" : "console-environment",
                "states" : {},
                "contexes" : {},
                "history" : [ ],
                "current" : null,
                "meta" : null,
                "timestamp" : Date.now(),
                "data" : {},
                "created_at" : Date.now(),
                "updated_at" : Date.now(),
                "session_start" : Date.now(),
                "session_id" : "test~from~console",
                "id" : "test~from~console"
            };
        }
    }

    private resetSession() {
        const jsonPath = `${os.homedir()}/.katasession`;

        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            return true;
        }
    }
}
