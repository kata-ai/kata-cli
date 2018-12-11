import { IHelper } from "interfaces/main";
import { Component, JsonObject } from "merapi";

export default class Team extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    public async addMember(username: string, options?: JsonObject) {
        try {
            const role = options.admin ? "teamAdmin" : "teamMember";
            const { userInfo, teamInfo, teamMember, currentLogin } = await this.getInfo(username);

            if (userInfo && userInfo.id) {
                if (this.checkUser(userInfo.id, teamMember)) {
                    throw new Error(`User ${username} already on this team`);
                }
                const { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, teamInfo.id, userInfo.id,  { roleId: role } );
                if (!response.body) { 
                    throw new Error("Error adding user to team: invalid roleId");
                }
                    
                console.log(`Success register ${username} to ${currentLogin}`);
            } else {
                console.log(`User ${username} not found`);
            }    
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }
    
    public async removeMember(username: string) {
        const answer = await this.helper.inquirerPrompt([
            {
                type: "confirm",
                name: "confirmation",
                message: `Do you want to remove ${username} ?`,
                default: false
            }
        ]);

        if (!answer.confirmation) {
            return;
        }

        try {
            const { userInfo, teamInfo, teamMember, currentLogin } = await this.getInfo(username);
             if (userInfo && userInfo.id) {
                if (!this.checkUser(userInfo.id, teamMember)) {
                    throw new Error(`User ${username} not a member of this team`);
                }

                const { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdDelete, teamInfo.id, userInfo.id);

                console.log(`Success remove ${username} from ${currentLogin}`);
            } else {
                console.log(`User ${username} not found`);
            }   

        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    private async getInfo(username: string) {
        const currentLogin = this.helper.getProp("current_login") as string;
        const currentUserType = this.helper.getProp("current_user_type") as string;

        if (currentUserType !== "team") {
            throw new Error("Must be on team to do this operation");
        }

        const requestTeamData =
            await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);

        let teamInfo: any;
        if (requestTeamData.response && requestTeamData.response.body) {
            teamInfo = requestTeamData.response.body;
        } else {
            throw new Error("Cannot add user to team");
        }
        
        const requestUserData =
            await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, username);

        let userInfo: any;
        if (requestUserData && requestUserData.response) {
            userInfo = requestUserData.response.body;
        } else {
            throw new Error("Cannot add user to team");
        }

        const requestTeamMember =
            await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersGet, teamInfo.id);

        let teamMember: any;
        if (requestTeamMember && requestTeamMember.response) {
            teamMember = requestTeamMember.response.body;
        } else {
            throw new Error("Cannot add user to team");
        }

        return {
            teamInfo,
            userInfo,
            teamMember,
            currentLogin
        };
    }

    private checkUser(userId : string, member : any) : boolean {
        const teamMember = member.map((x: JsonObject) => x.userId);
        if (teamMember.indexOf(userId) > -1) {
            return true;
        }

        return false;
    }
    
}
