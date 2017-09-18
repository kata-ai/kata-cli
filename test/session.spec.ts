import { IConfigReader, IConfig, Config } from "merapi";
import { suite, test } from "mocha-typescript";
import { spy, stub, assert } from "sinon";
import { IHelper } from "../interfaces/main";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import Helper from "../components/scripts/helper";
import Zaun from "../components/zaun-client/zaun";
import Api from "../components/api";
import Session from "../components/session";

@suite class SessionTest {
    private config: IConfig;
    private helper: IHelper;
    private api: any;
    private session: any;
    private botId = "botId";
    private defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";
    private sessionObj = {
        id: '54cb46c1-21d6-4be0-803f-702b55c7206e',
        channelId: 'a036f75a-e6d2-40d7-be1b-273151efd7f4',
        deploymentId: '521a8ba2-b7c2-4e76-8714-507af6db1055',
        dataKey: <string> null,
        states: {},
        contexes: {},
        history: <string[]> [],
        current: <string> null,
        meta: { lastFlow: 'fallback', lastState: 'sayHi', end: true },
        timestamp: 0,
        data: {},
        createdAt: 1505476435806
    }
    private updatedSessionObj = {
        id: '54cb46c1-21d6-4be0-803f-702b55c7206e',
        channelId: 'a036f75a-e6d2-40d7-be1b-273151efd7f4',
        deploymentId: '521a8ba2-b7c2-4e76-8714-507af6db1055',
        dataKey: <string> null,
        states: {},
        contexes: {},
        history: <string[]> ["history"],
        current: "current",
        meta: { lastFlow: 'fallback', lastState: 'sayHi', end: true },
        timestamp: 0,
        data: {
            name: "dataName"
        },
        createdAt: 1505476435806
    }

    constructor() {
        let zaun = Zaun();
        let configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.api = new Api(this.helper, zaun);
        this.session = new Session(this.helper, this.api);
    }

    @test async "function get should get session successfully"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botId);
        let getSessionStub = stub(this.api.sessionApi, "botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet").callsFake((botId, deploymentId, sessionId, mode, callback) => {
            callback(null, this.sessionObj);
        });
        let consoleDirStub = stub(console, "dir");
        await this.session.get(this.sessionObj.id);

        getBotIdStub.restore();
        getSessionStub.restore();
        consoleDirStub.restore();
        assert.calledWith(consoleDirStub, this.sessionObj);
    }

    @test async "function create should create session successfully"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botId);
        let createSessionStub = stub(this.api.sessionApi, "botsBotIdDeploymentsDeploymentIdSessionsPost").callsFake((botId, deploymentId, body, callback) => {
            callback(null, this.sessionObj);
        });
        let consoleLogStub = stub(console, "log");

        await this.session.create(this.sessionObj.id, this.sessionObj.deploymentId, { data: JSON.stringify(this.sessionObj) });
        
        getBotIdStub.restore();
        createSessionStub.restore();
        consoleLogStub.restore();
        assert.calledWith(createSessionStub, this.botId, this.sessionObj.deploymentId, this.sessionObj);
        assert.calledWith(consoleLogStub, this.sessionObj);
        assert.calledWith(consoleLogStub, "Session created successfully");
    }

    @test async "function update should update session successfully"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botId);
        let updateSessionStub = stub(this.api.sessionApi, "botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut").callsFake((botId, deploymentId, sessionId, body, callback) => {
            callback(null, this.updatedSessionObj);
        });
        let consoleLogStub = stub(console, "log");

        await this.session.update(this.sessionObj.id, this.sessionObj.deploymentId, { data: JSON.stringify(this.updatedSessionObj) });
        
        getBotIdStub.restore();
        updateSessionStub.restore();
        consoleLogStub.restore();
        assert.calledWith(updateSessionStub, this.botId, this.sessionObj.deploymentId, this.sessionObj.id, this.updatedSessionObj);
        assert.calledWith(consoleLogStub, this.updatedSessionObj);
        assert.calledWith(consoleLogStub, "Session updated successfully");
    }

    @test async "function delete should delete session successfully"() {
        let getBotIdStub = stub(this.helper, "getBotId").returns(this.botId);
        let deleteSessionStub = stub(this.api.sessionApi, "botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete").callsFake((botId, deploymentId, sessionId, callback) => {
            callback(null, this.sessionObj);
        });
        let consoleDirStub = stub(console, "dir");
        let consoleLogStub = stub(console, "log");
        await this.session.delete(this.sessionObj.id);

        getBotIdStub.restore();
        deleteSessionStub.restore();
        consoleDirStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleDirStub, this.sessionObj);
        assert.calledWith(consoleLogStub, "Session deleted successfully");
    }
}