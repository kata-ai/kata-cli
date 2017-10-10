import { IConfigReader, IConfig, Config } from "merapi";
import { suite, test } from "mocha-typescript";
import { spy, stub, assert } from "sinon";
import { IHelper } from "../../interfaces/main";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import Helper from "../../components/scripts/helper";
import Zaun from "../../components/api/zaun";
import Api from "../../components/api/api";
import Team from "../../components/users/team";

@suite class TeamTest {
    private config: IConfig;
    private helper: IHelper;
    private api: any;
    private session: any;
    private team: any;

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
        type: 'user2',
        label: 'dashboard',
        userId: '05c7f7a7-fba6-437a-8e6d-72c9f71c6352',
        roleId: 'b3941608-1494-4983-9b64-af746b601190',
        expire: 1506915325
    }
    private teamObj = {
        id: 'e563ec87-dae9-45f0-a2b3-515a069fb2b0',
        username: 'team1',
        password: 'password',
        type: 'team',
        email: <string> null,
        profile: <string> null,
        roleId: '55f7d797-a938-4f59-9c6a-cf6cd8a01d08',
        created_at: '2017-06-18T01:46:13.000Z',
        updated_at: '2017-06-18T01:46:13.000Z'
    }

    constructor() {
        let zaun = Zaun();
        let configJson = safeLoad(readFileSync("./service.yml", "utf8"));
        this.config = Config.create(configJson);
        this.helper = new Helper(this.config);
        this.api = new Api(this.helper, zaun);
        this.team = new Team(this.helper, this.api);
    }

    @test async "function add member should add member successfully"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet");
        let teamPostStub = stub(this.api.teamApi, "teamsTeamIdUsersUserIdPost");
        let teamGetStub = stub(this.api.teamApi, "teamsTeamIdUsersGet");

        getPropStub.withArgs("current_login").returns("team1");
        getPropStub.withArgs("current_user_type").returns("team"); 
        getUserInfoStub.withArgs("team1").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        getUserInfoStub.withArgs("user2").callsFake((userId, callback) => {
            callback(null, this.userObj);
        });
        teamGetStub.callsFake((teamId, callback) => {
            callback(null, null, {body: [{userId: "anotherUserId"}]});
        });
        teamPostStub.callsFake((teamId, userId, roleId, callback) => {
            callback(null, null, {body: {team: this.teamObj}});
        })

        await this.team.addMember("user2", "roleId-test");

        setPropStub.restore();
        getPropStub.restore();
        getUserInfoStub.restore();
        teamGetStub.restore();
        teamPostStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Success register user2 to team1");
    }

    @test async "function add member should throw error when current login is user"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("current_login").returns("user1");
        getPropStub.withArgs("current_user_type").returns("user"); 

        await this.team.addMember("user2", "roleId-test");

        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Must be on team to do this operation");
    }
    
     @test async "function add member should throw error when username is already in team"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet");
        let teamGetStub = stub(this.api.teamApi, "teamsTeamIdUsersGet");

        getPropStub.withArgs("current_login").returns("team1");
        getPropStub.withArgs("current_user_type").returns("team"); 
        getUserInfoStub.withArgs("team1").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        getUserInfoStub.withArgs("user2").callsFake((userId, callback) => {
            callback(null, this.userObj);
        });
        teamGetStub.callsFake((teamId, callback) => {
            callback(null, null, {body: [{userId: this.userObj.id}]});
        });

        await this.team.addMember("user2", "roleId-test");

        setPropStub.restore();
        getPropStub.restore();
        getUserInfoStub.restore();
        teamGetStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "User user2 already on this team");
    }

    @test async "function remove member should remove member successfully"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet");
        let teamDeleteStub = stub(this.api.teamApi, "teamsTeamIdUsersUserIdDelete");
        let teamGetStub = stub(this.api.teamApi, "teamsTeamIdUsersGet");

        getPropStub.withArgs("current_login").returns("team1");
        getPropStub.withArgs("current_user_type").returns("team"); 
        getUserInfoStub.withArgs("team1").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        getUserInfoStub.withArgs("user2").callsFake((userId, callback) => {
            callback(null, this.userObj);
        });
        teamGetStub.callsFake((teamId, callback) => {
            callback(null, null, {body: [{userId: this.userObj.id}]});
        });
        teamDeleteStub.callsFake((teamId, userId, callback) => {
            callback(null, null, {body: {team: this.teamObj}});
        })

        await this.team.removeMember("user2");

        setPropStub.restore();
        getPropStub.restore();
        getUserInfoStub.restore();
        teamGetStub.restore();
        teamDeleteStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Success remove user2 from team1");
    }

    @test async "function remove member should throw error when current login is user"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");

        getPropStub.withArgs("current_login").returns("user1");
        getPropStub.withArgs("current_user_type").returns("user"); 

        await this.team.removeMember("user2");

        setPropStub.restore();
        getPropStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "Must be on team to do this operation");
    }

     @test async "function remove member should throw error when username is not member of the team"() {
        let consoleLogStub = stub(console, "log");
        let setPropStub = stub(this.helper, "setProp");
        let getPropStub = stub(this.helper, "getProp");
        let getUserInfoStub = stub(this.api.userApi, "usersUserIdGet");
        let teamGetStub = stub(this.api.teamApi, "teamsTeamIdUsersGet");

        getPropStub.withArgs("current_login").returns("team1");
        getPropStub.withArgs("current_user_type").returns("team"); 
        getUserInfoStub.withArgs("team1").callsFake((userId, callback) => {
            callback(null, this.teamObj);
        });
        getUserInfoStub.withArgs("user2").callsFake((userId, callback) => {
            callback(null, this.userObj);
        });
        teamGetStub.callsFake((teamId, callback) => {
            callback(null, null, {body: [{userId: "anotherUserId"}]});
        });

        await this.team.removeMember("user2");

        setPropStub.restore();
        getPropStub.restore();
        getUserInfoStub.restore();
        teamGetStub.restore();
        consoleLogStub.restore();
        assert.calledWith(consoleLogStub, "User user2 not a member of this team");
    }
    
}