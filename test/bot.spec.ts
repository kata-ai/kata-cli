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
        assert.calledWith(dumpYamlStub, "./bot.yml", {
            config: { maxRecursion: 10, messages: "$include(./messages.yml)" },
            desc: "Bot Description",
            flows: { fallback: "$include(./flows/fallback.yml)" },
            id: "botId",
            methods: {
                'confidenceLevel(message,context,data,options,config)': {
                code: 'function confidenceLevel(message, context, data, options, config) { if (message.content === "hi") return 1; return 0; }',
                entry: "confidenceLevel"
                }
            },
            name: "Bot Name",
            nlus: "$include(./nlu.yml)",
            schema: "kata.ai/schema/kata-ml/1.0",
            tag: "latest",
            version: "1.0.0"
            });
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
        assert.calledWith(dumpYamlStub, "./bot.yml", {
            config: { maxRecursion: 10, messages: "$include(./messages.yml)" },
            desc: "Bot Description",
            flows: { fallback: "$include(./flows/fallback.yml)" },
            id: "botId",
            methods: {
                'confidenceLevel(message,context,data,options,config)': {
                code: 'function confidenceLevel(message, context, data, options, config) { if (message.content === "hi") return 1; return 0; }',
                entry: "confidenceLevel"
                }
            },
            name: "Bot Name",
            nlus: "$include(./nlu.yml)",
            schema: "kata.ai/schema/kata-ml/1.0",
            tag: "latest",
            version: "0.0.1"
            });
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
        let getFileStub = stub(this.helper, "getFiles").returns(["data1"]);
        let loadYamlStub = stub(this.helper, "loadYaml").returns({schema: "kata.ai/schema/kata-ml/1.0/test/intents"});
        let getBotIdStub = stub(this.helper, "getBotId").returns("testBotId");
        
        let execIntentTestStub = stub(this.tester, "execIntentTest").returns({results: {intents: {field: "intentsA", expect: "true", result: "true"}}});
        await this.bot.test();
        
        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({schema: "kata.ai/schema/kata-ml/1.0/test/states"});
        let execStateTestStub = stub(this.tester, "execStateTest").returns({results: {intents: {field: "statesA", expect: "true", result: "true"}}});
        await this.bot.test();

        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({schema: "kata.ai/schema/kata-ml/1.0/test/actions"});
        let execActionsTestStub = stub(this.tester, "execActionsTest").returns({results: {intents: {field: "actionsA", expect: "true", result: "true"}}});
        await this.bot.test();

        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({schema: "kata.ai/schema/kata-ml/1.0/test/flow"});
        let execFlowTestStub = stub(this.tester, "execFlowTest").returns({results: {intents: {field: "flowsA", expect: "true", result: "true"}}});
        await this.bot.test();

        getBotIdStub.restore();
        getFileStub.restore();
        loadYamlStub.restore();
        execIntentTestStub.restore();
        execStateTestStub.restore();
        execActionsTestStub.restore();
        execFlowTestStub.restore();


        assert.calledWith(getFileStub, "./test", ".spec.yml");
        assert.calledOnce(execIntentTestStub);
        assert.calledOnce(execStateTestStub);
        assert.calledOnce(execActionsTestStub);
        assert.calledOnce(execFlowTestStub);
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