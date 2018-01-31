import { IConfigReader, ILogger, Config, IConfig } from "merapi";
import { suite, test } from "mocha-typescript";
import { stub, spy, assert } from "sinon";
import { IHelper } from "../../interfaces/main";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import Helper from "../../components/scripts/helper";
import Api from "../../components/api/api";
import Deployment from "../../components/bots/deployment";
import Zaun from "../../components/api/zaun";
import { v4 as uuid } from "uuid";
const Table = require("cli-table");

@suite class DeploymentTest {
    private config : IConfig;
    private helper : IHelper;
    private api : any;
    private deployment : any;
    private emptyDeploymentObj = {
        name: "test",
        botId: "739b5e9f-d5e1-44b1-93a8-954d291df170",
        botVersion: "1.0.5",
        channels: {}
    };
    private deploymentObj = {
        name: "test",
        botId: "739b5e9f-d5e1-44b1-93a8-954d291df170",
        botVersion: "1.0.5",
        channels: {
            fb: "a22867dd-ce49-4afe-b7d1-3199c01e1c51",
            line: "b02eb207-8f8a-480d-8c32-606b0fa7dfe7"
        }
    };
    private channelObj = {
        name: "fb",
        id: this.deploymentObj.channels.fb,
        type: "messenger",
        token: "tokenChannel",
        refreshToken: "refreshToken",
        secret: "secretKey",
        url: "http://url",
        webhook: "https://urlwebhook"
    };

    private channelObjWithOptions = {
        name: "fb",
        id: this.deploymentObj.channels.fb,
        type: "messenger",
        token: "tokenChannel",
        refreshToken: "refreshToken",
        secret: "secretKey",
        url: "http://url",
        additionalOptions: { botEmail: "test@test.com" },
        webhook: "https://urlwebhook"
    };
    private webhook = "https://kanal.katalabs.io";

    constructor() {
        const configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        const zaun = Zaun();
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.api = new Api(this.helper, zaun);
        this.deployment = new Deployment(this.helper, this.api, this.config);
    }

    @test public async "function deploy should create deployment successfully"() {
        const createdDeploymentId = uuid();
        const optsCreateDeployment = {
            body: {
                name: this.deploymentObj.name,
                botVersion: this.deploymentObj.botVersion,
                channels: {}
            }
        };
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getBotVersionStub = stub(this.api.botApi, "botsBotIdVersionsGet").callsFake((botId, callback) => {
            callback(null, { versions: [this.deploymentObj.botVersion], latest: this.deploymentObj.botVersion });
        });
        const createDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsPost").callsFake((botId, opts, callback) => {
            callback(null, { ...this.deploymentObj, channels: {}, id: createdDeploymentId });
        });
        const consoleLogStub = stub(console, "log");
        const consoleDirStub = stub(console, "dir");

        await this.deployment.deploy(this.deploymentObj.name, this.deploymentObj.botVersion, {});

        getBotIdStub.restore();
        getBotVersionStub.restore();
        createDeploymentStub.restore();
        consoleLogStub.restore();
        consoleDirStub.restore();
        assert.calledOnce(getBotVersionStub);
        assert.calledOnce(createDeploymentStub);
        assert.calledOnce(consoleLogStub);
        assert.calledOnce(consoleDirStub);
        assert.calledWith(getBotVersionStub, this.deploymentObj.botId);
        assert.calledWith(createDeploymentStub, this.deploymentObj.botId, optsCreateDeployment);
        assert.calledWith(consoleLogStub, "DEPLOYMENT CREATED SUCCESSFULLY");
        assert.calledWith(consoleDirStub, { ...this.deploymentObj, channels: {}, id: createdDeploymentId, tag: null });
    }

    @test public async "function deploy should update deployment successfully if deployment has been created"() {
        const createdDeploymentId = uuid();
        const body = {
            name: this.deploymentObj.name,
            botVersion: this.deploymentObj.botVersion
        };
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getBotVersionStub = stub(this.api.botApi, "botsBotIdVersionsGet").callsFake((botId, callback) => {
            callback(null, { versions: ["1.0.0", "1.0.1", this.deploymentObj.botVersion], latest: this.deploymentObj.botVersion });
        });
        const getDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdGet").callsFake((botId, deploymentId, callback) => {
            callback(null, this.deploymentObj);
        });
        const updateDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdPut").callsFake((botId, deploymentId, body, callback) => {
            callback(null, { ...this.deploymentObj, id: createdDeploymentId });
        });
        const consoleLogStub = stub(console, "log");
        const consoleDirStub = stub(console, "dir");

        await this.deployment.deploy(this.deploymentObj.name, null, {});

        getBotIdStub.restore();
        getBotVersionStub.restore();
        getDeploymentStub.restore();
        updateDeploymentStub.restore();
        consoleLogStub.restore();
        consoleDirStub.restore();
        assert.calledOnce(getBotVersionStub);
        assert.calledOnce(getDeploymentStub);
        assert.calledOnce(updateDeploymentStub);
        assert.calledOnce(consoleLogStub);
        assert.calledOnce(consoleDirStub);
        assert.calledWith(getBotVersionStub, this.deploymentObj.botId);
        assert.calledWith(getDeploymentStub, this.deploymentObj.botId, this.deploymentObj.name);
        assert.calledWith(updateDeploymentStub, this.deploymentObj.botId, this.deploymentObj.name, body);
        assert.calledWith(consoleLogStub, "DEPLOYMENT UPDATED SUCCESSFULLY");
        assert.calledWith(consoleDirStub, { ...this.deploymentObj, id: createdDeploymentId, tag: "latest" });
    }

    @test public async "function deploy throw error if bot with botVersion is undefined"() {
        const createdDeploymentId = uuid();
        const optsCreateDeployment = {
            body: {
                name: this.deploymentObj.name,
                botVersion: this.deploymentObj.botVersion,
                channels: {}
            }
        };
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getBotVersionStub = stub(this.api.botApi, "botsBotIdVersionsGet").callsFake((botId, callback) => {
            callback(null, { versions: [this.deploymentObj.botVersion], latest: this.deploymentObj.botVersion });
        });
        const consoleLogStub = stub(console, "log");

        await this.deployment.deploy(this.deploymentObj.name, "1.0.6", {});

        getBotIdStub.restore();
        getBotVersionStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(getBotVersionStub);
        assert.calledOnce(consoleLogStub);
        assert.calledWith(getBotVersionStub, this.deploymentObj.botId);
        assert.calledWith(consoleLogStub, "INVALID TAG");
    }

    @test public async "function add channel with additional options should add channel to deployment successfully"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdGet").callsFake((botId, deploymentId, callback) => {
            callback(null, this.emptyDeploymentObj);
        });
        const createChannelStub = stub(this.api.channelApi, "botsBotIdDeploymentsDeploymentIdChannelsPost").callsFake((body, botId, deploymentId, callback) => {
            callback(null, this.channelObjWithOptions);
        });
        const consoleLogStub = stub(console, "log");
        const channels : { [name : string] : string } = {};
        channels[this.channelObjWithOptions.name] = this.channelObjWithOptions.id;

        const channelData = {
            id: this.channelObjWithOptions.id,
            name: this.channelObjWithOptions.name,
            type: this.channelObjWithOptions.type,
            url: this.channelObjWithOptions.url,
            options: {
                token: this.channelObjWithOptions.token,
                refreshToken: this.channelObjWithOptions.refreshToken,
                secret: this.channelObjWithOptions.secret,
                botEmail: this.channelObjWithOptions.additionalOptions.botEmail
            }
        };

        await this.deployment.addChannel(this.deploymentObj.name, "fb", { data: JSON.stringify(this.channelObjWithOptions) });

        getBotIdStub.restore();
        getDeploymentStub.restore();
        consoleLogStub.restore();
        createChannelStub.restore();
        assert.calledOnce(getDeploymentStub);
        assert.calledOnce(createChannelStub);
        assert.calledWith(createChannelStub, channelData, this.deploymentObj.botId, this.deploymentObj.name);
        assert.calledWith(consoleLogStub, "CHANNEL ADDED SUCCESSFULLY");
        assert.calledWith(consoleLogStub, `Paste this url to ${channelData.type} webhook : ${this.channelObjWithOptions.webhook}`);
    }

    @test public async "function add channel should show error if channel name added has been used"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdGet").callsFake((botId, deploymentId, callback) => {
            callback(null, this.deploymentObj);
        });
        const consoleLogStub = stub(console, "log");

        await this.deployment.addChannel(this.deploymentObj.name, "fb", {});

        getBotIdStub.restore();
        getDeploymentStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(getDeploymentStub);
        assert.calledWith(consoleLogStub, "CHANNEL NAME HAS BEEN USED");
    }

    @test public async "function remove channel should remove channel successfully"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdGet").callsFake((botId, deploymentId, callback) => {
            callback(null, this.deploymentObj);
        });
        const removeChannelStub = stub(this.api.channelApi, "botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete").callsFake((botId, deploymentId, channelId, callback) => {
            callback();
        });
        const consoleLogStub = stub(console, "log");

        await this.deployment.removeChannel(this.deploymentObj.name, "fb", {});

        getBotIdStub.restore();
        getDeploymentStub.restore();
        removeChannelStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(getDeploymentStub);
        assert.calledOnce(removeChannelStub);
        assert.calledOnce(consoleLogStub);
        assert.calledWith(removeChannelStub, this.deploymentObj.botId, this.deploymentObj.name, this.channelObj.id);
        assert.calledWith(consoleLogStub, "CHANNEL REMOVED SUCCESSFULLY");
    }

    @test public async "function remove channel should throw error if channel not found in deployment"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const getDeploymentStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdGet").callsFake((botId, deploymentId, callback) => {
            callback(null, this.emptyDeploymentObj);
        });
        const consoleLogStub = stub(console, "log");

        await this.deployment.removeChannel(this.deploymentObj.name, "fb", {});

        getBotIdStub.restore();
        getDeploymentStub.restore();
        consoleLogStub.restore();
        assert.calledOnce(getDeploymentStub);
        assert.calledWith(consoleLogStub, "CHANNEL NOT FOUND");
    }

    @test public async "should call zaun api to drop deployment"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const deploymentApiDeleteStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsDeploymentIdDelete").callsFake((botId, deploymentId, callback) => {
            callback(null, this.deploymentObj);
        });
        const consoleStub = stub(console, "log");

        await this.deployment.drop(this.deploymentObj.name, {});

        consoleStub.restore();
        getBotIdStub.restore();
        deploymentApiDeleteStub.restore();
        assert.calledOnce(deploymentApiDeleteStub);
        assert.calledWith(consoleStub, this.deploymentObj);
        assert.calledWith(consoleStub, "DEPLOYMENT DELETED SUCCESSFULLY");
    }

    @test public async "should call zaun api to list deployment"() {
        const getBotIdStub = stub(this.helper, "getBotId").returns(this.deploymentObj.botId);
        const deploymentApiDeleteStub = stub(this.api.deploymentApi, "botsBotIdDeploymentsGet").callsFake((botId, { }, callback) => {
            callback(null, null, { body: [this.deploymentObj] });
        });
        const consoleStub = stub(console, "log");
        await this.deployment.list();

        const table = new Table({
            head: ["Deployment Name", "Version"],
            colWidths: [30, 10]
        });
        table.push([this.deploymentObj.name, this.deploymentObj.botVersion]);

        consoleStub.restore();
        getBotIdStub.restore();
        deploymentApiDeleteStub.restore();
        assert.calledOnce(deploymentApiDeleteStub);
        assert.calledWith(consoleStub, table.toString());
    }
}
