import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");

export default class Team extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    async addMember(username : string, options? : JsonObject) {
        try {
            let role = options.admin ? "teamAdmin" : "teamMember";
            let { userInfo, teamInfo, teamMember, currentLogin } = await this.getInfo(username);

            if (userInfo && userInfo.id) {
                if (this.checkUser(userInfo.id, teamMember))
                    throw new Error(`User ${username} already on this team`);

                let { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, teamInfo.data.id, userInfo.id,  { roleId: role } );
                if (!response.body) 
                    throw new Error("Error adding user to team: invalid roleId");
                    
                console.log(`Success register ${username} to ${currentLogin}`);
            } else {
                console.log(`User ${username} not found`);
            }    
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }
    
    async removeMember(username : string) {
        let answer = await this.helper.inquirerPrompt([
            {
                type: "confirm",
                name: "confirmation",
                message: `Do you want to remove ${username} ?`,
                default: false
            }
        ]);

        if (!answer.confirmation)
            return;

        try {
            let { userInfo, teamInfo, teamMember, currentLogin } = await this.getInfo(username);
             if (userInfo && userInfo.id) {
                if (!this.checkUser(userInfo.id, teamMember))
                    throw new Error(`User ${username} not a member of this team`);

                let { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdDelete, teamInfo.data.id, userInfo.id);

                console.log(`Success remove ${username} from ${currentLogin}`);
            } else {
                console.log(`User ${username} not found`);
            }   

        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    private async getInfo(username : string) {
        let currentLogin = <string> this.helper.getProp("current_login");
        let currentUserType = <string> this.helper.getProp("current_user_type");

        if (currentUserType !== "team")
            throw new Error("Must be on team to do this operation");
        
        let team = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);
        let { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, username);
        let member = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersGet, team.data.id);

        return {
            teamInfo: team,
            userInfo: data,
            teamMember: member,
            currentLogin: currentLogin
        }
    }

    private checkUser(userId : string, member : any) : boolean {
        let teamMember = member.response.body.map((x : JsonObject) => x.userId);
        if (teamMember.indexOf(userId) > -1)
            return true;

        return false;
    }
    
}