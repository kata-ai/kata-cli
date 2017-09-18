import { IConfig, Config } from "merapi";
import { suite, test } from "mocha-typescript";
import { safeLoad } from "js-yaml";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { IHelper, ICompile, ITester } from "../interfaces/main";
import { stub, SinonStub, assert } from "sinon";
import { deepEqual } from "assert";
import Api from "../components/api";
import Bot from "../components/bot";
import Helper from "../components/scripts/helper";
import Compile from "../components/scripts/compile";
import Tester from "../components/scripts/tester";
import Zaun from "../components/zaun-client/zaun";

@suite class BotTest {
    private config: IConfig;
    private helper: IHelper;
    private compile: ICompile;
    private tester: ITester;
    private api: any;
    private bot: any;
    private botDesc = {
        schema: "kata.ai/schema/kata-ml/1.0",
        name: "Bot Name",
        desc: "Bot Description",
        version: "1.0.0",
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
                code: 'function confidenceLevel(message, context, data, options, config) { if (message.content === "hi") return 1; return 0; }',
                entry: "confidenceLevel"
            }
        },
        id: "botId"
    }
    private fallbackFlow = {
        priority: 0,
        fallback: true,
        intents: {
            hi: {
                initial: true,
                type: "text",
                classifier: {
                    nlu: "confidenceLevel",
                    match: 1
                }
            },
            dunno: {
                fallback: true
            }
        },
        states: {
            init: {
                initial: true,
                transitions: {
                    sayHi: {
                        condition: "intent==\"hi\""
                    },
                    sorry: {
                        fallback: true
                    }
                }
            },
            sayHi: {
                end: true,
                action: [{ name: "sayHi" }]
            },
            sorry: {
                end: true,
                action: [ { name: "saySorry" } ],
            }
        },
        actions: {
            sayHi: {
                type: "text",
                options: {
                    data: "$(config.messages)",
                    path: "templates",
                    template: "$[sayHi]"
                }
            },
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
    private messages = {
        templates: {
            sayHi: "Hi, ada yang bisa saya bantu?",
            saySorry: "Maaf, saya tidak mengerti kata-kata anda."
        }
    };
    private nlus = {
        confidenceLevel: {
            type: "method",
            method: "confidenceLevel"
        }
    }
    private botDescFull = {
        schema: "kata.ai/schema/kata-ml/1.0",
        name: "Bot Name",
        desc: "Bot Description",
        version: "1.0.0",
        flows: {
            fallback: {
                priority: 0,
                fallback: true,
                intents: {
                    hi: {
                        initial: true,
                        type: "text",
                        classifier: { nlu: "confidenceLevel", match: 1 }
                    },
                   dunno: { fallback: true }
                },
                states: {
                    init: {
                        initial: true,
                        transitions: {
                            sayHi: { condition: 'intent=="hi"' },
                            sorry: { fallback: true }
                        }
                    },
                    sayHi: { end: true, action: [ { name: "sayHi" } ] },
                    sorry: { end: true, action: [ { name: "saySorry" } ] } },
                actions: {
                    sayHi: {
                        type: "text",
                        options: {
                            data: "$(config.messages)",
                            path: "templates",
                            template: "$[sayHi]"
                        }
                    },
                    saySorry: {
                        type: "text",
                        options: {
                            data: "$(config.messages)",
                            path: "templates",
                            template: "$[saySorry]"
                        }
                    }
                }
            }
        },
        config: {
            messages: {
                templates: {
                    sayHi: "Hi, ada yang bisa saya bantu?",
                    saySorry: "Maaf, saya tidak mengerti kata-kata anda."
                }
            },
            maxRecursion: 10
        },
        nlus: { confidenceLevel: { type: "method", method: "confidenceLevel" } },
        methods: {
            'confidenceLevel(message,context,data,options,config)': {
                code: 'function confidenceLevel(message, context, data, options, config) { if (message.content === "hi") return 1; return 0; }',
                entry: "confidenceLevel"
            }
        },
        id: "botId"
    };
    private userTokenObj = {
        id: '84330d2b-f2f8-499c-adee-99d2c533e7d5',
        type: 'user',
        label: 'dashboard',
        userId: '5c0a78c2-3a2c-447a-80d2-069761be3ef9',
        teamId: <string>null,
        botId: <string>null,
        roleId: 'ccd9b640-93c4-43b6-8523-f324f89faad6',
        expire: 1503789662
    };
    private teamTokenObj = {
        id: 'ea43b3b6-3c7f-4bd8-98f3-e58ee699b5b3',
        type: 'team',
        label: <string>null,
        userId: '8a62686d-695c-44f0-a57c-4ca19f5bf78b',
        teamId: 'e563ec87-dae9-45f0-a2b3-515a069fb2b0',
        botId: <string>null,
        roleId: '81b179bc-fa56-4c27-92db-a1602abe48c2',
        expire: 1506907823
    };
    private userObj = {
        id: '9ad603b7-5c33-432c-9752-2f4816b6bd9f',
        type: 'user',
        label: 'dashboard',
        userId: '05c7f7a7-fba6-437a-8e6d-72c9f71c6352',
        roleId: 'b3941608-1494-4983-9b64-af746b601190',
        expire: 1506915325
    }
    private teamObj = {
        id: 'e563ec87-dae9-45f0-a2b3-515a069fb2b0',
        username: 'user1',
        password: 'password',
        type: 'team',
        email: <string> null,
        profile: <string> null,
        roleId: '55f7d797-a938-4f59-9c6a-cf6cd8a01d08',
        created_at: '2017-06-18T01:46:13.000Z',
        updated_at: '2017-06-18T01:46:13.000Z',
        teams: <string[]> []
    }

    constructor() {
        let configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        let zaun = Zaun();
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.compile = new Compile(this.helper);
        this.tester = new Tester(this.config, this.helper);
        this.api = new Api(this.helper, zaun);
        this.bot = new Bot(this.compile, this.helper, this.tester, this.api);
    }

    @test async "should call init bot successfully"() {
        let createDirStub = stub(this.helper, "createDirectory");
        let dumpYamlStub = stub(this.helper, "dumpYaml");
        let consoleLogStub = stub(console, "log");

        this.bot.init(this.botDesc.id, this.botDesc.name, this.botDesc.version);

        createDirStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(createDirStub);
        assert.callCount(dumpYamlStub, 4);
        assert.calledWith(createDirStub, "./flows", 0o755);
        assert.calledWith(dumpYamlStub, "./bot.yml", this.botDesc);
        assert.calledWith(dumpYamlStub, "./flows/fallback.yml", this.fallbackFlow);
        assert.calledWith(dumpYamlStub, "./messages.yml", this.messages);
        assert.calledWith(dumpYamlStub, "./nlu.yml", this.nlus);
        assert.calledWith(consoleLogStub, "INIT BOT SUCCESSFULLY");
    }

    @test async "should call init bot successfully when user does not provide bot version"() {
        let createDirStub = stub(this.helper, "createDirectory");
        let dumpYamlStub = stub(this.helper, "dumpYaml");
        let consoleLogStub = stub(console, "log");

        this.bot.init(this.botDesc.id, this.botDesc.name);

        createDirStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(createDirStub);
        assert.callCount(dumpYamlStub, 4);
        assert.calledWith(createDirStub, "./flows", 0o755);
        assert.calledWith(dumpYamlStub, "./bot.yml", { ...this.botDesc, version: "0.0.1" });
        assert.calledWith(dumpYamlStub, "./flows/fallback.yml", this.fallbackFlow);
        assert.calledWith(dumpYamlStub, "./messages.yml", this.messages);
        assert.calledWith(dumpYamlStub, "./nlu.yml", this.nlus);
        assert.calledWith(consoleLogStub, "INIT BOT SUCCESSFULLY");
    }

    @test async "should throw error when botId is not defined"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(null);
        let error;

        try {
            await this.bot.versions();
        } catch (e) {
            error = e;
        }

        getBotIdStub.restore();
        deepEqual(error.message, "BOT ID HAS NOT DEFINED");
    }

    @test async "should call bot versions successfully"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botDesc.id);
        let consoleLogStub = stub(console, "log");
        let botApiVersions = stub(this.api.botApi, "botsBotIdVersionsGet").callsFake(function fakeFn(botId, callback) {
            callback();
        });

        await this.bot.versions();

        getBotIdStub.restore();
        consoleLogStub.restore();
        botApiVersions.restore();
        assert.calledOnce(botApiVersions);
    }

    // TODO
    @test async "function test should call intents, states, actions, and flow test api"() {

    }

    @test async "function login should call login api successfully with user token"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getTokenInfoStub = stub(this.api.authApi, "tokensTokenIdGet").callsFake((tokenId, callback) => {
            callback(null, this.userTokenObj);
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.bot.login("user", null, { token: "userToken" });

        getTokenStub.restore();
        getTokenInfoStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        assert.calledWith(setPropStub, "current_login", "user");
        assert.calledWith(setPropStub, "token", { user: "userToken" });
    }

    @test async "function login should call login api successfully with team token"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getTokenInfoStub = stub(this.api.authApi, "tokensTokenIdGet").callsFake((tokenId, callback) => {
            callback(null, this.teamTokenObj);
        });
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.bot.login("team", null, { token: "teamToken" });

        getTokenStub.restore();
        getTokenInfoStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        assert.calledWith(setPropStub, "current_login", this.teamObj.username);
        assert.calledWith(setPropStub, "token", { "user1": "teamToken" });
    }

    @test async "function login should throw error if token type not user and not team"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getTokenInfoStub = stub(this.api.authApi, "tokensTokenIdGet").callsFake((tokenId, callback) => {
            callback(null, {});
        });
        let consoleLogStub = stub(console, "log");

        await this.bot.login("user", null, { token: "userToken" });

        getTokenStub.restore();
        getTokenInfoStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Invalid token");
    }

    @test async "function login should call login api successfully with username & password"() {
        let authObj = {
            user: "user1",
            password: "pass1"
        };
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let loginStub = stub(this.api.authApi, "loginPost").callsFake((body, callback) => {
            callback(null, this.userObj);
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.bot.login("user", null, { "user": "user1", "password": "pass1" });

        getTokenStub.restore();
        loginStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        assert.calledWith(setPropStub, "current_login", authObj.user);
        assert.calledWith(setPropStub, "token", { "user1": this.userObj.id });
    }

    @test async "function login should switch team successfully with team name"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        let createTokenTeamStub = stub(this.api.authApi, "tokensPost").callsFake((body, callback) => {
            callback(null, this.teamTokenObj);
        })
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.bot.login("team", "team1", {});

        getTokenStub.restore();
        getUserInfoStub.restore();
        createTokenTeamStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        assert.calledWith(setPropStub, "current_login", "team1");
        assert.calledWith(setPropStub, "token", { "team1": this.teamTokenObj.id });
    }

    @test async "function login should throw error when user not defined team name to switch"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let consoleLogStub = stub(console, "log");

        await this.bot.login("team", null, {});

        getTokenStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "You need to provide teamname to login to team");
    }

    @test async "function login should throw error when user not login before switch team"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let consoleLogStub = stub(console, "log");

        await this.bot.login("team", null, {});

        getTokenStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "You need to provide teamname to login to team");
    }

    @test async "function login should throw error when type is not team or user"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({});
        let consoleLogStub = stub(console, "log");

        await this.bot.login("team", "team1", {});

        getTokenStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "You need to login your user before login to team");
    }

    @test async "should call list bots"() {
        let botsGetStub = stub(this.api.botApi, "botsGet").callsFake(function fakeFn(opts, callback) {
            callback();
        });
        let consoleLogStub = stub(console, "log");

        await this.bot.list();

        botsGetStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(botsGetStub);
    }

    @test async "function bot update should call create bot api when gets error bot not found"() {
        let botObj = {
            resolve: () => {},
            get: () => this.botDescFull
        };
        let configCreateStub = stub(Config, "create").returns({});
        let loadYamlStub = stub(this.helper, "loadYaml").returns(this.botDesc);
        let execDirectiveStub = stub(this.compile, "execDirectives").returns(botObj);
        let updateBotStub = stub(this.api.botApi, "botsBotIdPut").callsFake((botId, body, opts, callback) => {
            callback(new Error("Bot not found."));
        });
        let createBotStub = stub(this.api.botApi, "botsPost").callsFake((body, callback) => {
            callback(null, { version: this.botDesc.version });
        });
        let dumpYamlStub = stub(this.helper, "dumpYaml");
        let consoleLogStub = stub(console, "log");

        await this.bot.update({});

        configCreateStub.restore();
        loadYamlStub.restore();
        execDirectiveStub.restore();
        updateBotStub.restore();
        createBotStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(updateBotStub);
        assert.calledOnce(createBotStub);
        assert.calledWith(updateBotStub, this.botDescFull.id, this.botDescFull, {});
        assert.calledWith(createBotStub, this.botDescFull);
        assert.calledWith(dumpYamlStub, "./bot.yml", this.botDesc);
    }

    @test async "function bot update should call update bot api"() {
        let botObj = {
            resolve: () => {},
            get: () => this.botDescFull
        };
        let updatedVersion = "2.0.0";
        let configCreateStub = stub(Config, "create").returns({});
        let loadYamlStub = stub(this.helper, "loadYaml").returns(this.botDesc);
        let execDirectiveStub = stub(this.compile, "execDirectives").returns(botObj);
        let updateBotStub = stub(this.api.botApi, "botsBotIdPut").callsFake((botId, body, opts, callback) => {
            callback(null, { version: updatedVersion });
        });
        let dumpYamlStub = stub(this.helper, "dumpYaml");
        let consoleLogStub = stub(console, "log");

        await this.bot.update({ rev: "major" });

        configCreateStub.restore();
        loadYamlStub.restore();
        execDirectiveStub.restore();
        updateBotStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(updateBotStub);
        assert.calledWith(configCreateStub, { ...this.botDesc, version: updatedVersion });
        assert.calledWith(updateBotStub, this.botDescFull.id, this.botDescFull, {});
        assert.calledWith(dumpYamlStub, "./bot.yml", { ...this.botDesc, version: updatedVersion });
    }

    @test async "function bot delete should call delete bot api"() {
        let inquirerPromptStub = stub(this.helper, "inquirerPrompt").returns({ confirmation: true })
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botDesc.id);
        let deleteBotStub = stub(this.api.botApi, "botsBotIdDelete").callsFake((botId, callback) => {
            callback(null, {});
        });
        let consoleLogStub = stub(console, "log");

        await this.bot.delete();
        
        inquirerPromptStub.restore();
        getBotIdStub.restore();
        deleteBotStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(deleteBotStub);
        assert.calledWith(deleteBotStub, this.botDesc.id);
    }
}