"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
class Api extends merapi_1.Component {
    constructor(helper, zaun) {
        super();
        this.helper = helper;
        this.zaun = zaun;
        this.apiClient = this.zaun.ApiClient.instance;
        let basePath = this.helper.getProp("zaunUrl") || "http://zaun.katalabs.io";
        this.apiClient.basePath = basePath;
        this.bearer = this.apiClient.authentications['Bearer'];
        let currentLogin = this.helper.getProp("current_login") || "user";
        let tokenObj = this.helper.getProp("token") || {};
        this.bearer.apiKey = `Bearer ${tokenObj[currentLogin]}`;
        this.botApi = new this.zaun.BotApi();
        this.authApi = new this.zaun.AuthApi();
        this.userApi = new this.zaun.UserApi();
        this.teamApi = new this.zaun.TeamApi();
        this.deploymentApi = new this.zaun.DeploymentApi();
        this.channelApi = new this.zaun.ChannelApi();
        this.sessionApi = new this.zaun.SessionApi();
        this.cachesApi = new this.zaun.CacheApi();
        this.utilApi = new this.zaun.UtilApi();
        this.nluApi = new this.zaun.NluApi();
    }
}
exports.default = Api;
//# sourceMappingURL=api.js.map