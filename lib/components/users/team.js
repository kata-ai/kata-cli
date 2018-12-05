"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
class Team extends merapi_1.Component {
    constructor(helper, api) {
        super();
        this.helper = helper;
        this.api = api;
    }
    addMember(username, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = options.admin ? "teamAdmin" : "teamMember";
                const { userInfo, teamInfo, teamMember, currentLogin } = yield this.getInfo(username);
                if (userInfo && userInfo.id) {
                    if (this.checkUser(userInfo.id, teamMember)) {
                        throw new Error(`User ${username} already on this team`);
                    }
                    const { response } = yield this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, teamInfo.data.id, userInfo.id, { roleId: role });
                    if (!response.body) {
                        throw new Error("Error adding user to team: invalid roleId");
                    }
                    console.log(`Success register ${username} to ${currentLogin}`);
                }
                else {
                    console.log(`User ${username} not found`);
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    removeMember(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const answer = yield this.helper.inquirerPrompt([
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
                const { userInfo, teamInfo, teamMember, currentLogin } = yield this.getInfo(username);
                if (userInfo && userInfo.id) {
                    if (!this.checkUser(userInfo.id, teamMember)) {
                        throw new Error(`User ${username} not a member of this team`);
                    }
                    const { response } = yield this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdDelete, teamInfo.data.id, userInfo.id);
                    console.log(`Success remove ${username} from ${currentLogin}`);
                }
                else {
                    console.log(`User ${username} not found`);
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    getInfo(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentLogin = this.helper.getProp("current_login");
            const currentUserType = this.helper.getProp("current_user_type");
            if (currentUserType !== "team") {
                throw new Error("Must be on team to do this operation");
            }
            const team = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);
            const { data } = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, username);
            const member = yield this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersGet, team.data.id);
            return {
                teamInfo: team,
                userInfo: data,
                teamMember: member,
                currentLogin
            };
        });
    }
    checkUser(userId, member) {
        const teamMember = member.response.body.map((x) => x.userId);
        if (teamMember.indexOf(userId) > -1) {
            return true;
        }
        return false;
    }
}
exports.default = Team;
//# sourceMappingURL=team.js.map