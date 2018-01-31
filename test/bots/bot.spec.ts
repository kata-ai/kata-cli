import { IConfig, Config } from "merapi";
import { suite, test } from "mocha-typescript";
import { safeLoad } from "js-yaml";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { IHelper, ICompile, ITester } from "../../interfaces/main";
import { stub, SinonStub, assert } from "sinon";
import { deepEqual } from "assert";
import Api from "../../components/api/api";
import Bot from "../../components/bots/bot";
import Helper from "../../components/scripts/helper";
import Compile from "../../components/scripts/compile";
import Tester from "../../components/scripts/tester";
import Zaun from "../../components/api/zaun";

@suite class BotTest {
    private config : IConfig;
    private helper : IHelper;
    private compile : ICompile;
    private tester : ITester;
    private api : any;
    private bot : any;
    private botDesc = {
        schema: "kata.ai/schema/kata-ml/1.0",
        name: "Bot Name",
        desc: "My First Bot",
        version: "1.0.0",
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
        },
        id: "botId"
    };

    constructor() {
        const configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        const zaun = Zaun();
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.compile = new Compile(this.helper);
        this.tester = new Tester(this.config, this.helper);
        this.api = new Api(this.helper, zaun);
        this.bot = new Bot(this.compile, this.helper, this.tester, this.api);
    }

    @test public async "should call init bot successfully"() {
        const createDirStub = stub(this.helper, "createDirectory");
        const dumpYamlStub = stub(this.helper, "dumpYaml");
        const consoleLogStub = stub(console, "log");

        this.bot.init(this.botDesc.name, this.botDesc.version, {});

        const bot = Object.assign({}, this.botDesc);
        delete bot.id;

        createDirStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.callCount(dumpYamlStub, 1);
        assert.calledWith(dumpYamlStub, "./bot.yml", bot);
        assert.calledWith(consoleLogStub, "Initialized Bot Name successfully");
    }

    @test public async "should call init bot successfully when user does not provide bot version"() {
        const createDirStub = stub(this.helper, "createDirectory");
        const dumpYamlStub = stub(this.helper, "dumpYaml");
        const consoleLogStub = stub(console, "log");

        this.bot.init(this.botDesc.name, null, {});

        const bot = Object.assign({}, this.botDesc);
        delete bot.id;
        bot.version = "0.0.1";

        createDirStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.callCount(dumpYamlStub, 1);
        assert.calledWith(dumpYamlStub, "./bot.yml", bot);
        assert.calledWith(consoleLogStub, "Initialized Bot Name successfully");
    }

    @test public async "should throw error when botId is not defined"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(null);
        const consoleLogStub = stub(console, "log");
        let error;

        try {
            await this.bot.versions();
        } catch (e) {
            error = e;
        }

        getBotIdStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "BOT ID HAS NOT DEFINED");
    }

    @test public async "should call bot versions successfully"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.botDesc.id);
        const consoleLogStub = stub(console, "log");
        const botApiVersions = stub(this.api.botApi, "botsBotIdVersionsGet").callsFake(function fakeFn(botId, callback) {
            callback();
        });

        await this.bot.versions();

        getBotIdStub.restore();
        consoleLogStub.restore();
        botApiVersions.restore();
        assert.calledOnce(botApiVersions);
    }

    // TODO
    @test public async "function test should call intents, states, actions, and flow test api"() {
        const getFileStub = stub(this.helper, "getFiles").returns(["data1"]);
        let loadYamlStub = stub(this.helper, "loadYaml").returns({ schema: "kata.ai/schema/kata-ml/1.0/test/intents" });
        const getBotIdStub = stub(this.helper, "getBotId").returns("testBotId");

        const execIntentTestStub = stub(this.tester, "execIntentTest").returns({ results: { intents: { field: "intentsA", expect: "true", result: "true" } } });
        await this.bot.test();

        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({ schema: "kata.ai/schema/kata-ml/1.0/test/states" });
        const execStateTestStub = stub(this.tester, "execStateTest").returns({ results: { intents: { field: "statesA", expect: "true", result: "true" } } });
        await this.bot.test();

        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({ schema: "kata.ai/schema/kata-ml/1.0/test/actions" });
        const execActionsTestStub = stub(this.tester, "execActionsTest").returns({ results: { intents: { field: "actionsA", expect: "true", result: "true" } } });
        await this.bot.test();

        loadYamlStub.restore();
        loadYamlStub = stub(this.helper, "loadYaml").returns({ schema: "kata.ai/schema/kata-ml/1.0/test/flow" });
        const execFlowTestStub = stub(this.tester, "execFlowTest").returns({ results: { intents: { field: "flowsA", expect: "true", result: "true" } } });
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

    @test public async "should call list bots"() {
        const botsGetStub = stub(this.api.botApi, "botsGet").callsFake(function fakeFn(opts, callback) {
            callback();
        });
        const consoleLogStub = stub(console, "log");

        await this.bot.list();

        botsGetStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(botsGetStub);
    }

    @test public async "function bot update should create bot when bot id not found"() {
        const bot = Object.assign({}, this.botDesc);
        delete bot.id;

        const botObj = {
            resolve: () => { },
            get: () => bot
        };
        const configCreateStub = stub(Config, "create").returns({});
        const loadYamlStub = stub(this.helper, "loadYaml").returns(bot);
        const execDirectiveStub = stub(this.compile, "execDirectives").returns(botObj);
        const createBotStub = stub(this.api.botApi, "botsPost").callsFake(function fakeFn(body, callback) {
            callback(null, { version: this.botDesc.version });
        });
        const dumpYamlStub = stub(this.helper, "dumpYaml");
        const consoleLogStub = stub(console, "log");

        await this.bot.update({});

        configCreateStub.restore();
        loadYamlStub.restore();
        execDirectiveStub.restore();
        createBotStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(createBotStub);
        assert.calledWith(createBotStub, bot);
        assert.calledWith(dumpYamlStub, "./bot.yml", bot);
    }

    @test public async "function bot update should call update bot api"() {
        const botObj = {
            resolve: () => { },
            get: () => this.botDesc
        };
        const updatedVersion = "2.0.0";
        const configCreateStub = stub(Config, "create").returns({});
        const loadYamlStub = stub(this.helper, "loadYaml").returns(this.botDesc);
        const execDirectiveStub = stub(this.compile, "execDirectives").returns(botObj);
        const updateBotStub = stub(this.api.botApi, "botsBotIdPut").callsFake((botId, body, opts, callback) => {
            callback(null, { version: updatedVersion });
        });
        const dumpYamlStub = stub(this.helper, "dumpYaml");
        const consoleLogStub = stub(console, "log");

        await this.bot.update({ rev: "major" });

        configCreateStub.restore();
        loadYamlStub.restore();
        execDirectiveStub.restore();
        updateBotStub.restore();
        dumpYamlStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(updateBotStub);
        assert.calledWith(configCreateStub, { ...this.botDesc, version: updatedVersion });
        assert.calledWith(updateBotStub, this.botDesc.id, this.botDesc, {});
        assert.calledWith(dumpYamlStub, "./bot.yml", { ...this.botDesc, version: updatedVersion });
    }

    @test public async "function bot delete should call delete bot api"() {
        const inquirerPromptStub = stub(this.helper, "inquirerPrompt").returns({ confirmation: true });
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.botDesc.id);
        const deleteBotStub = stub(this.api.botApi, "botsBotIdDelete").callsFake((botId, callback) => {
            callback(null, {});
        });
        const consoleLogStub = stub(console, "log");

        await this.bot.delete();

        inquirerPromptStub.restore();
        getBotIdStub.restore();
        deleteBotStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(deleteBotStub);
        assert.calledWith(deleteBotStub, this.botDesc.id);
    }

    @test public async "should pull bot with valid bot name"() {
        const dumpYamlStub = stub(this.helper, "dumpYaml");
        const botsGetStub = stub(this.api.botApi, "botsGet").callsFake((body, callback) => {
            callback(null, { items: [this.botDesc] });
        });
        const botsBotIdGet = stub(this.api.botApi, "botsBotIdGet").callsFake((botId, callback) => {
            callback(null, this.botDesc);
        });
        const consoleLogStub = stub(console, "log");

        await this.bot.pull(this.botDesc.name, this.botDesc.version, {});

        dumpYamlStub.restore();
        botsGetStub.restore();
        botsBotIdGet.restore();
        consoleLogStub.restore();
        assert.calledOnce(botsGetStub);
        assert.callCount(dumpYamlStub, 1);
        assert.calledWith(dumpYamlStub, "./bot.yml", this.botDesc);
        assert.calledWith(consoleLogStub, `SUCCESS PULL BOT ${this.botDesc.name} WITH VERSION ${this.botDesc.version}`);
    }
}
