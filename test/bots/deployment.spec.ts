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
    private config: IConfig;
    private helper: IHelper;
    private api: any;
    private deployment: any;
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
        this.deployment = new Deployment(this.helper, this.api);
    }

    @test public async "function create deployment should create deployment successfully"() {
        const projectIdStub = stub(this.helper, "getProjectId").returns("projectId1");
        const projectId = "projectId1";
        const projectApiStub = stub(this.api.projectApi, "projectsProjectIdGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { project: { nluRevision: "nlurev1", botRevision: "botrev1", cmsRevision: "cmsrev1",  } } })
        });
        const botRevApiStub = stub(this.api.botApi, "projectsProjectIdBotRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "botrev1"} ] }  });
        });
        const nluRevApiStub = stub(this.api.projectApi, "projectsProjectIdNluRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "nlurev1"} ] }  });
        });
        const cmsRevApiStub = stub(this.api.projectApi, "projectsProjectIdCmsRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "cmsrev1"} ] } });
        });
        const prevDeplymentStub = stub(this.api.projectApi, "projectsProjectIdDeploymentGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { version: "0.0.1" } });
        });
        const deploymentApiStub = stub(this.api.deploymentApi, "projectsProjectIdDeploymentVersionsPost").callsFake(({}, projectId, callback) => {
            callback(null, null, { body: { result: "ok" }});
        });

        const consoleLogStub = stub(console, "log");

        await this.deployment.create();

        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Succesfully create Deployment to version 0.0.2");
    }

    @test public async "function create deployment with patch version should create deployment successfully"() {
        const projectIdStub = stub(this.helper, "getProjectId").returns("projectId1");
        const projectId = "projectId1";
        const projectApiStub = stub(this.api.projectApi, "projectsProjectIdGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { project: { nluRevision: "nlurev1", botRevision: "botrev1", cmsRevision: "cmsrev1",  } } })
        });
        const botRevApiStub = stub(this.api.botApi, "projectsProjectIdBotRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "botrev1"} ] }  });
        });
        const nluRevApiStub = stub(this.api.projectApi, "projectsProjectIdNluRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "nlurev1"} ] }  });
        });
        const cmsRevApiStub = stub(this.api.projectApi, "projectsProjectIdCmsRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "cmsrev1"} ] } });
        });
        const prevDeplymentStub = stub(this.api.projectApi, "projectsProjectIdDeploymentGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { version: "0.0.1" } });
        });
        const deploymentApiStub = stub(this.api.deploymentApi, "projectsProjectIdDeploymentVersionsPost").callsFake(({}, projectId, callback) => {
            callback(null, null, { body: { result: "ok" }});
        });

        const consoleLogStub = stub(console, "log");

        await this.deployment.create("patch");

        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Succesfully create Deployment to version 0.0.2");
    }

    @test public async "function create deployment with minor version should create deployment successfully"() {
        const projectIdStub = stub(this.helper, "getProjectId").returns("projectId1");
        const projectId = "projectId1";
        const projectApiStub = stub(this.api.projectApi, "projectsProjectIdGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { project: { nluRevision: "nlurev1", botRevision: "botrev1", cmsRevision: "cmsrev1",  } } })
        });
        const botRevApiStub = stub(this.api.botApi, "projectsProjectIdBotRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "botrev1"} ] }  });
        });
        const nluRevApiStub = stub(this.api.projectApi, "projectsProjectIdNluRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "nlurev1"} ] }  });
        });
        const cmsRevApiStub = stub(this.api.projectApi, "projectsProjectIdCmsRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "cmsrev1"} ] } });
        });
        const prevDeplymentStub = stub(this.api.projectApi, "projectsProjectIdDeploymentGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { version: "0.0.1" } });
        });
        const deploymentApiStub = stub(this.api.deploymentApi, "projectsProjectIdDeploymentVersionsPost").callsFake(({}, projectId, callback) => {
            callback(null, null, { body: { result: "ok" }});
        });

        const consoleLogStub = stub(console, "log");

        await this.deployment.create("minor");

        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Succesfully create Deployment to version 0.1.0");
    }

    @test public async "function create deployment with major version should create deployment successfully"() {
        const projectIdStub = stub(this.helper, "getProjectId").returns("projectId1");
        const projectId = "projectId1";
        const projectApiStub = stub(this.api.projectApi, "projectsProjectIdGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { project: { nluRevision: "nlurev1", botRevision: "botrev1", cmsRevision: "cmsrev1",  } } })
        });
        const botRevApiStub = stub(this.api.botApi, "projectsProjectIdBotRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "botrev1"} ] }  });
        });
        const nluRevApiStub = stub(this.api.projectApi, "projectsProjectIdNluRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "nlurev1"} ] }  });
        });
        const cmsRevApiStub = stub(this.api.projectApi, "projectsProjectIdCmsRevisionsGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { data: [ {revision: "cmsrev1"} ] } });
        });
        const prevDeplymentStub = stub(this.api.projectApi, "projectsProjectIdDeploymentGet").callsFake((projectId, callback) => {
            callback(null, null, { body: { version: "0.0.1" } });
        });
        const deploymentApiStub = stub(this.api.deploymentApi, "projectsProjectIdDeploymentVersionsPost").callsFake(({}, projectId, callback) => {
            callback(null, null, { body: { result: "ok" }});
        });

        const consoleLogStub = stub(console, "log");

        await this.deployment.create("major");

        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Succesfully create Deployment to version 1.0.0");
    }

    @test public async "function list deployment should list deployment successfully"() {
        const projectIdStub = stub(this.helper, "getProjectId").returns("projectId1");
        const projectId = "projectId1";
        const projectApiStub = stub(this.api.deploymentApi, "projectsProjectIdDeploymentVersionsGet").callsFake((projectId, {}, callback) => {
            callback(null, null, { body: { data: [{ name: "depl01", version: "0.0.1", botRevision: "ah42das",  }] } })
        });

        const consoleErrorStub = stub(console, "error");
        const consoleLogStub = stub(console, "log");
        await this.deployment.list();
        consoleErrorStub.restore();
        consoleLogStub.restore();
        assert.notCalled(consoleErrorStub);
    }

    
}
