
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IUtils, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");

export default class Bot extends Component {
    constructor(private compile : ICompile, private utils: IUtils, private tester: ITester, private api: any) {
        super();
    }

    init(bot: string, name: string, version: string, options: JsonObject) {
        if (!version)
            version = "0.0.1";

        let botDesc = {
            schema: "kata.ai/schema/kata-ml/1.0",
            name,
            desc: "Bot",
            version,
            flows: {
                "fallback": "$include(./flows/fallback.yml)"
            },
            config: {
                "messages": "$include(./messages.yml)",
                "maxRecursion": 10
            },
            nlus: "$include(./nlu.yml)",
            methods: {
                'confidenceLevel(message,context,data,options,config)': {
                    code: 'function confidenceLevel(message, context, data, options, config) { return 1; }',
                    entry: "confidenceLevel"
                }
            },
            id: uuid()
        }

        let fallbackFlow = {
            priority: 0,
            fallback: true,
            intents: {
                dunno: {
                    initial: true,
                    fallback: true
                }
            },
            states: {
                sorry: {
                    initial: true,
                    end: true,
                    action: [ { name: 'saySorry' } ],
                    transitions: {
                        sorry: {
                            fallback: true
                        }
                    }
                }
            },
            actions: {
                saySorry: {
                    type: "text",
                    options: {
                        data: "$(config.messages)",
                        path: "templates",
                        template: "$[saySorry]"
                    }
                }
            }
        };

        let messages = {
            templates: {
                saySorry: 'type=text;;message=Maaf, Veronika tidak mengerti kata-kata yang Kamu tulis'
            }
        };

        let nlus = {
            confidenceLevel: {
                type: "method",
                method: "confidenceLevel"
            }
        }

        this.utils.createDirectory("./flows", 0o755);
        this.utils.dumpYaml("./bot.yml", botDesc);
        this.utils.dumpYaml("./flows/fallback.yml", fallbackFlow);
        this.utils.dumpYaml("./messages.yml", messages);
        this.utils.dumpYaml("./nlu.yml", nlus);

        console.log("INIT BOT SUCCESSFULLY");
    }

    async versions(options: JsonObject) {
        let botId = this.utils.getBotId();

        if (!botId)
            throw new Error("BOT ID HAS NOT DEFINED");

        try {
            let {data, response} = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, botId);
            console.log("VERSIONS");

            data.versions.forEach((botVersion: string) => {
                console.log(`- ${botVersion}${botVersion === data.latest ? " (LATEST)" : ""}`);
            });
        } catch (e) {
            let errorMessage;
            
            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async test(file: string, options: JsonObject) {
        let testFiles = file ? [file] : this.utils.getFiles("./test", ".spec.yml");
        let botId = this.utils.getBotId();

        if (!botId)
            throw new Error("BOT ID HAS NOT DEFINED");

        let results : JsonObject = {};

        for (let i=0; i<testFiles.length; i++) {
            let yaml = this.utils.loadYaml(testFiles[i]);
            let res;

            switch(yaml.schema) {
                case "kata.ai/schema/kata-ml/1.0/test/intents":
                    res = await this.tester.execIntentTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res))
                        results[testFiles[i]] = res;
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/states":
                    res = await this.tester.execStateTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res))
                        results[testFiles[i]] = res;
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/actions":
                    res = await this.tester.execActionsTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res))
                        results[testFiles[i]] = res;
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/flow":
                    res = await this.tester.execFlowTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res))
                        results[testFiles[i]] = res;
                    break;
            }
        }

        this.printResult(<IHash<IHash<{field: string, expect: string, result: string}[]>>> results);
    }

    private hasErrors(res: any) {
        return Object.keys(res).some(key => (res[key] && res[key].length) || res[key] === null);
    }

    private printResult(results : IHash<IHash<{field: string, expect: string, result: string}[]>> = {}) {
        if (Object.keys(results).length) {
            console.log(colors.red("Errors:"));
            for (let i in results) {
                console.log(`    ${i}:`)
                for (let j in results[i]) {
                    if (!results[i][j]) {
                        console.log(`        ${colors.red(j+":")}`);
                        console.log(`            diaenne returns ${colors.red("null")}`);
                        continue;
                    }
                    if (results[i][j].length) {
                        console.log(`        ${colors.red(j+":")}`);

                        results[i][j].forEach(res => {
                            console.log(`            expecting ${res.field} to be ${colors.green(res.expect)} but got ${colors.red(res.result)}`);
                        });
                    }
                }
            }
        }
    }

    async login(type: string, name: string, options: JsonObject) {
        try {
            let currToken = this.utils.getCurrentToken()["token"];
            
            if (options.token) {
                if (!currToken)
                    currToken = <string>options.token;

                this.api.loginApi.apiClient.defaultHeaders.Authorization = `Bearer ${currToken}`;
                let result = await this.utils.toPromise(this.api.loginApi, this.api.loginApi.tokensTokenIdGet, options.token);
                let tokenObj = result.data;

                if (tokenObj.type === "user") {
                    this.setToken("user", <string> options.token);
                }
                else if (tokenObj.type === "team") {
                    result = await this.utils.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, tokenObj.teamId);
                    let team = result.data;

                    this.setToken(team.username, <string> options.token);
                }
                else {
                    throw new Error("Invalid token");
                }
            }
            else if (type === "team") {
                if (!name)
                    throw new Error("You need to provide teamname to login to team");

                if (!currToken)
                    throw new Error("You need to login your user before login to team");

                let result = await this.utils.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, name);
                let team = result.data;

                let body = {
                    type: "team",
                    teamId: team.id
                };

                result = await this.utils.toPromise(this.api.loginApi, this.api.loginApi.tokensPost, body);
                let teamToken = result.data;

                this.setToken(name, teamToken.id);
            }
            else if (type === "user") {
                let user = options.user ? options.user : "";
                let pass = options.password ? options.password : "";

                let answer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "user",
                        message: "username: ",
                        when: function() {
                            return !user;
                        },
                        validate: function (user : string) {
                            if (!user)
                                return "Username cannot be empty";
                            
                            return true;
                        }
                    },
                    {
                        type: "password",
                        name: "password",
                        message: "password: ",
                        mask: "*",
                        when: function() {
                            return !pass;
                        },
                        validate: function (password: string) {
                            if (!password)
                                return "Password cannot be empty";
                            
                            return true;
                        }
                    }
                ]);

                if (answer.user)
                    user = answer.user;
                
                if (answer.password)
                    pass = answer.password;
                
                let body = {
                    username: user,
                    password: pass
                }

                let result = await this.utils.toPromise(this.api.loginApi, this.api.loginApi.loginPost, body);
                let userObj = result.data;

                this.setToken("user", userObj.id);
            }
            else {
                throw new Error("Type can only be \"team\" or \"user\"");
            }
        } catch (e) {
            let errorMessage;
            
            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async list(options: JsonObject) {
        try {
            let {data, response} = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsGet, {});

            console.log("LIST BOT");

            data.items.forEach((bot: {id: string, name: string, version: string, desc: string}) => {
                console.log(bot);
            });
        } catch (e) {
            let errorMessage;
            
            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async update(options: JsonObject) {
        let desc = this.utils.loadYaml("./bot.yml");

        let [major, minor, patch] = (<string>desc.version).split(".").map((val: string) => parseInt(val));

        switch(options.rev) {
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

        desc.version = `${major}.${minor}.${patch}`;
        
        let bot = Config.create(desc, {left:"${", right:"}"});
        bot = this.compile.execDirectives(bot, process.cwd());
        bot.resolve();

        let botDesc = bot.get();
        botDesc.name = botDesc.name || "bot";

        if (!botDesc.id) {
            let id = uuid();
            botDesc.id = id;
            desc.id = id;

            try {
                let result = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsPost, botDesc);
                console.log("BOT CREATED");
            }
            catch (e) {
                let errorMessage;
                
                if (e.response && e.response.body && e.response.body.message)
                    errorMessage = e.response.body.message;
                else
                    errorMessage = e.message;

                console.log(errorMessage);
            }
        }
        else {
            try {
                let result = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsBotIdPut, botDesc.id, botDesc, {});
                
                desc.version = result.data.version;

                console.log("UPDATE BOT SUCCESSFULLY");
            } catch (e) {
                let errorMessage;
                
                if (e.response && e.response.body && e.response.body.message)
                    errorMessage = e.response.body.message;
                else
                    errorMessage = e.message;

                errorMessage = errorMessage.replace(/\s/g, "_").toUpperCase();

                if (errorMessage === "BOT_NOT_FOUND.") {
                    let result = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsPost, botDesc);

                    desc.version = result.data.version;
                    console.log("UPDATE BOT SUCCESSFULLY");
                }
                else {
                    console.log(errorMessage);
                }
            }
        }

        this.utils.dumpYaml("./bot.yml", desc);
    }

    async delete(options: JsonObject) {
        let answer = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmation",
                message: "Are you sure to delete this bot?",
                default: false
            }
        ]);

        if (!answer.confirmation)
            return;

        let botId = this.utils.getBotId();

        try {
            let {data} = await this.utils.toPromise(this.api.botApi, this.api.botApi.botsBotIdDelete, botId);

            console.log("REMOVE BOT SUCCESSFULLY");
        } catch (e) {
            let errorMessage;
            
            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    private setToken(user: string, token: string) {
        this.utils.setProp("current_login", user);
        let tokenProp = <JsonObject>(this.utils.getProp("token") || {});
        tokenProp[user] = token;
        this.utils.setProp("token", tokenProp);
    }
}