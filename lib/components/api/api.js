"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
const pkg = require("../../package.json");
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
        const tokenObj = this.helper.getProp("token") || {};
        this.bearer.apiKey = `Bearer ${tokenObj[currentLogin]}`;
        this.timeout = this.helper.getProp("timeout") || 300000;
        this.gzip = this.helper.getProp("gzip") || "false";
        this.version = pkg.version;
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