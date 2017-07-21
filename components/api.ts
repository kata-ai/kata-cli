
import { JsonObject, Component } from "merapi";
import { IUtils } from "interfaces/main";

const zaun = require("../../components/javascript-client-generated/src/index.js");

export default class Api extends Component {
    private botApi: any;
    private authApi: any;
    private userApi: any;
    private deploymentApi: any;
    private channelApi: any;
    private sessionApi: any;

    constructor(private utils: IUtils) {
        super();
        this.botApi = new zaun.BotApi();
        this.authApi = new zaun.AuthApi();
        this.userApi = new zaun.UserApi();
        this.deploymentApi = new zaun.DeploymentApi();
        this.channelApi = new zaun.ChannelApi();
        this.sessionApi = new zaun.SessionApi();
        let currentLogin = <string> this.utils.getProp("current_login") || "user";
        let tokenObj = <JsonObject> this.utils.getProp("token") || {};

        this.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${tokenObj[currentLogin]}`;
    }
}