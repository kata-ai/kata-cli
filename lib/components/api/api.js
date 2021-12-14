"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
class Api extends merapi_1.Component {
    constructor(helper, zaun) {
        super();
        this.helper = helper;
        this.zaun = zaun;
        this.apiClient = this.zaun.ApiClient.instance;
        let basePath = this.helper.getProp("zaunUrl") || "https://api.kata.ai";
        this.apiClient.basePath = basePath;
        this.bearer = this.apiClient.authentications.Bearer;
        const currentLogin = this.helper.getProp("current_login") || "user";
        const currentUserType = this.helper.getProp("current_user_type") || "user";
        const tokenObj = this.helper.getProp("token") || {};
        this.bearer.apiKey = `Bearer ${tokenObj[currentLogin]}`;
        console.log("MNgigla", currentUserType);
        if (currentUserType === "team") {
            const teamId = this.helper.getProp("team_id");
            console.log({ teamId });
            this.apiClient.defaultHeaders = { "X-auth-teamid": teamId };
        }
        this.botApi = new this.zaun.BotApi();
        this.authApi = new this.zaun.AuthApi();
        this.userApi = new this.zaun.UserApi();
        this.teamApi = new this.zaun.TeamApi();
        this.deploymentApi = new this.zaun.DeploymentApi();
        this.projectApi = new zaun.ProjectApi();
        // this.draftApi = new this.zaun.DraftApi();
        // this.channelApi = new this.zaun.ChannelApi();
        // this.sessionApi = new this.zaun.SessionApi();
        // this.cachesApi = new this.zaun.CacheApi();
        // this.utilApi = new this.zaun.UtilApi();
        this.nluApi = new this.zaun.NluApi();
    }
}
exports.default = Api;
//# sourceMappingURL=api.js.map