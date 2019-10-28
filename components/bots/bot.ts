
import { ICompile, IHelper, ITester } from "interfaces/main";
import { Component, Config, IHash, JsonObject } from "merapi";
import { v4 as uuid } from "uuid";
import { CatchError } from "../scripts/helper";
import { isDate } from "util";
import inquirer = require("inquirer");
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as pako from "pako";

const Table = require("cli-table");
const colors = require("colors");
const repl = require("repl");
const util = require("util");
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

    @CatchError
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

        const projectId = this.getProject();

        botDesc.id = projectId;

        let latestBotRevision;
        try {
            const { response: { body: data } } = await this.helper.toPromise(
                this.api.projectApi,
                this.api.projectApi.projectsProjectIdBotGet, botDesc.id
            );

            if (data.revision) {
                latestBotRevision = data.revision;
                const url = `${this.api.apiClient.basePath}/projects/${projectId}/bot/revisions/${latestBotRevision}`;
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Authorization": this.api.bearer.apiKey,
                    },
                    timeout: this.api.timeout,
                }

                if (this.api.gzip) {
                    requestConfig.transformRequest = (data, headers) => {
                        headers["content-encoding"] = "gzip";
                        headers["content-type"] = "text/plain";
                        return pako.deflate(JSON.stringify(data), { to: "string" });
                    };
                }

                try {
                    const newBot = await axios.put(url, botDesc, requestConfig)
                        .then((response: AxiosResponse) => response.data);

                    // const { data: newBot } = await this.helper.toPromise(
                    //     this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsRevisionPut,
                    //     projectId, latestBotRevision, botDesc
                    // );
                    const { data: project } = await this.helper.toPromise(
                        this.api.projectApi,
                        this.api.projectApi.projectsProjectIdGet, projectId
                    );

                    console.log(`Updated bot ${colors.green(project.name)} with revision: ${newBot.revision.substring(0, 7)}`);
                } catch (e) {
                    console.error("Error while updating bot");
                    console.log(this.helper.wrapError(e));
                }
            } else {
                throw Error("Could not find latest bot revision from this project.");
            }
        } catch (e) {
            console.error("Error");
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

    public async console(options: JsonObject) {
        let projectId: string;
        let botDesc;
        try {
            projectId = this.getProject() as string;
            botDesc = this.helper.loadYaml("./bot.yml");
        } catch (error) {
            console.log(this.helper.wrapError(error));
            return;
        }

        const dataEnvironments = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet , projectId, null);
        const environments: object[] = dataEnvironments.response.body.data;
        const choicesEnvironment = environments.map((environment: any) => ({ name: environment.name, value: environment.name }));
        choicesEnvironment.push({ name: 'No Environment', value: null })

        let { environment } = await inquirer.prompt<any>([
            {
                type: "list",
                name: "environment",
                message: "Environment:",
                choices: choicesEnvironment
            }
        ]);

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
                environmentName: environment,
                session: currentSession,
                message
            };
            if (!body.environmentName) delete body.environmentName

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
                environmentName: environment,
                session: currentSession,
                message
            };
            if (!body.environmentName) delete body.environmentName

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
                environmentName: environment,
                session: currentSession,
                message
            };
            if (!body.environmentName) delete body.environmentName

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
                if (res.data !== "") {
                    done = true;
                    result = res;
                } else {
                    error = new Error("Error found. Please check your bot.");
                }
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

    public async pull(revision: string, options: JsonObject) {

        let projectId;
        let bots;
        let botDesc;

        try {
            projectId = this.getProject();
        } catch (e) {
            console.log(this.helper.wrapError(e));
            return;
        }
        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsGet, projectId);
            bots = body.data;

        } catch (e) {
            console.log("INVALID PROJECT");
            return;
        }
        try {
            if (!revision) {
                revision = bots[0].revision;
            }
            const { response: { body } } = await this.helper.toPromise(
                this.api.botApi, this.api.botApi.projectsProjectIdBotRevisionsRevisionGet, projectId, revision);
            botDesc = body;

        } catch (e) {
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

    public async errors() {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const dataEnvironments = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet , projectId, null);
                if (dataEnvironments && dataEnvironments.response && dataEnvironments.response.body && dataEnvironments.response.body.data && dataEnvironments.response.body.data.length > 0) {
                    const environments: object[] = dataEnvironments.response.body.data;
                    const choicesEnvironment = environments.map((environment: any) => ({
                        name: environment.name,
                        value: environment.id
                    }));

                    let { environmentId } = await inquirer.prompt<any>([
                        {
                            type: "list",
                            name: "environmentId",
                            message: "Environment:",
                            choices: choicesEnvironment
                        }
                    ]);

                    const dataChannels = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet , projectId, environmentId, null);
                    const channels: object[] = dataChannels.response.body;
                    const choicesChannel = channels.map((channel: any) => ({
                        name: channel.name,
                        value: channel.id
                    }));

                    let { channelId } = await inquirer.prompt<any>([
                        {
                            type: "list",
                            name: "channelId",
                            message: "Channel:",
                            choices: choicesChannel
                        }
                    ]);

                    let { start, end, error } = await inquirer.prompt<any>([
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
                                    value: {"group": 1000, "code":"1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100"}
                                },
                                {
                                    name: "System Error",
                                    value: {"group": 4000, "code":"4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4051,4052,4053,4054,4055,4056,4057,4058,4059,4060,4061,4062,4063,4064,4065,4066,4067,4068,4069,4070,4071,4072,4073,4074,4075,4076,4077,4078,4079,4080,4081,4082,4083,4084,4085,4086,4087,4088,4089,4090,4091,4092,4093,4094,4095,4096,4097,4098,4099,4100"}
                                }
                            ]
                        },
                    ]);

                    if (isDate(start) == false) {
                        start = new Date().setHours(0,0,0)
                    } else {
                        start = new Date(start).setHours(0,0,0)
                    }
                    if (isDate(end) == false) {
                        end = new Date().setHours(23,59,59)
                    } else {
                        end = new Date(end).setHours(23,59,59)
                    }

                    const errorGroup = error.group
                    const errorCode = error.code

                    const { response } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdErrorsGet , projectId, environmentId, channelId, errorGroup, errorCode, new Date(start).toISOString(), new Date(end).toISOString());

                    if (response && response.body && response.body.data) {
                        const table = new Table({
                            head: ["Time", "Error Code", "Error Message"],
                            colWidths: [25, 15, 75]
                        });
                        response.body.data.forEach((project: JsonObject) => {
                            table.push([project.timestamp, project.errorCode, project.errorMessage]);
                        });
                        console.log(table.toString());
                    }
                } else {
                    console.log("Failed to get Environment list");
                }
            } else {
                console.log("Please select Project first");
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }
}
