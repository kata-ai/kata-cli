import { IConfigReader, IConfig, Config } from "merapi";
import { suite, test } from "mocha-typescript";
import { spy, stub, assert } from "sinon";
import { IHelper } from "../interfaces/main";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import Helper from "../components/scripts/helper";
import Zaun from "../components/zaun-client/zaun";
import Api from "../components/api";
import User from "../components/user";

@suite class UserTest {
    private config: IConfig;
    private helper: IHelper;
    private api: any;
    private session: any;
    private user: any;

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
        teams: <any[]> [{teamId: 'e563ec87-dae9-45f0-a2b3-515a069fb2b0'}]
    }

    constructor() {
        let zaun = Zaun();
        let configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.api = new Api(this.helper, zaun);
        this.user = new User(this.helper, this.api);
    }

    @test async "function login should call login api successfully with user token"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getTokenInfoStub = stub(this.api.authApi, "tokensTokenIdGet").callsFake((tokenId, callback) => {
            callback(null, this.userTokenObj);
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.user.login({ token: "userToken" });

        getTokenStub.restore();
        getTokenInfoStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        assert.calledWith(setPropStub, "current_login", "user");
        assert.calledWith(setPropStub, "token", { user: "userToken" });
    }

    @test async "function whoami should print current user login"() {
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getTokenInfoStub = stub(this.api.authApi, "tokensTokenIdGet").callsFake((tokenId, callback) => {
            callback(null, this.userTokenObj);
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns("user");
        let consoleLogStub = stub(console, "log");

        await this.user.login({ token: "userToken" });
        this.user.whoami();
        consoleLogStub.restore();
        getTokenStub.restore();
        getTokenInfoStub.restore();
        setPropStub.restore();
        getPropStub.restore();

        assert.calledWith(getPropStub, "current_login");
        assert.calledWith(getPropStub, "current_user_type");
        assert.calledWith(consoleLogStub, "Current login: user, login type: user");
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

        await this.user.login({ token: "teamToken" });

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

        await this.user.login({ token: "userToken" });

        getTokenStub.restore();
        getTokenInfoStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Invalid token");
    }

    @test async "function login should call login api successfully with username & password"() {
        let consoleLogStub = stub(console, "log");
        let authObj = {
            user: "user1",
            password: "pass1"
        };
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let loginStub = stub(this.api.authApi, "loginPost").callsFake((body, callback) => {
            callback(null, this.userObj);
        });
        let userInfoStub = stub(this.api.userApi, "usersUserIdGet").callsFake((body, callback) => {
            callback(null, {data: {id: "test", type: "user"}});
        });
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp").returns({});

        await this.user.login({ user: "user1", password: "pass1" });

        getTokenStub.restore();
        loginStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(setPropStub, "current_login", authObj.user);
        assert.calledWith(setPropStub, "token", { "user1": this.userObj.id });
    }

    @test async "function switch should switch team successfully with team name"() {
        let consoleLogStub = stub(console, "log");
        let getTokenStub = stub(this.helper, "getCurrentToken").returns({token: "token"});
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        let createTokenTeamStub = stub(this.api.authApi, "tokensPost").callsFake((body, callback) => {
            callback(null, this.teamTokenObj);
        })
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("first_login").returns({user: "user1", type: "user"});
        getPropStub.withArgs("current_user_type").returns("user");

        await this.user.switch("team", "team1");

        getTokenStub.restore();
        getUserInfoStub.restore();
        createTokenTeamStub.restore();
        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(setPropStub, "current_login", "team1");
        assert.calledWith(setPropStub, "token", { "team1": this.teamTokenObj.id });
    }

    @test async "function switch should switch user successfully from team"() {
        let consoleLogStub = stub(console, "log");
        
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("first_login").returns({username: "user1", type: "user"});
        getPropStub.withArgs("current_user_type").returns("team");
        getPropStub.withArgs("current_login").returns("user1");

        await this.user.switch("user");

        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(setPropStub, "current_login", "user1");
        assert.calledWith(setPropStub, "current_user_type", "user");
    }

    @test async "function switch should throw error when switch to current login type"() {
        let consoleLogStub = stub(console, "log");
        
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("first_login").returns({user: "user1", type: "user"});
        getPropStub.withArgs("current_user_type").returns("user");

        await this.user.switch("user");

        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Unable to switch : already on user");
    }

    @test async "function switch should throw error when switch to user from team first login"() {
        let consoleLogStub = stub(console, "log");
        
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("first_login").returns({user: "user1", type: "team"});
        getPropStub.withArgs("current_user_type").returns("team");

        await this.user.switch("user");

        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Unable to switch : Invalid type");
    }

    @test async "function logout should logout successfully"() {
        let consoleLogStub = stub(console, "log");
        let inquirerPromptStub = stub(this.helper, "inquirerPrompt").returns({ confirmation: true })
        let sDeleteStub = stub(this.helper, "softDelete").returns(true);

        await this.user.logout();

        consoleLogStub.restore();
        inquirerPromptStub.restore();
        sDeleteStub.restore();
        assert.called(sDeleteStub);
    }

    
}