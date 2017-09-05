
import { JsonObject, Component } from "merapi";
import { IHelper } from "interfaces/main";

const zaun = require("../../components/javascript-client-generated/src/index.js");

export default class Api extends Component {
    private apiClient: any;
    private bearer: any;
    private botApi: any;
    private authApi: any;
    private userApi: any;
    private deploymentApi: any;
    private channelApi: any;
    private sessionApi: any;
    private cachesApi: any;

    constructor(private helper: IHelper) {
        super();
        
        this.apiClient = zaun.ApiClient.instance;
        let basePath = this.helper.getProp("zaunUrl") || "http://zaun.katalabs.io";
        
        this.apiClient.basePath = basePath;
        this.bearer = this.apiClient.authentications['Bearer'];
        let currentLogin = <string> this.helper.getProp("current_login") || "user";
        let tokenObj = <JsonObject> this.helper.getProp("token") || {};
        this.bearer.apiKey = `Bearer ${tokenObj[currentLogin]}`;
        
        this.botApi = new zaun.BotApi();
        this.authApi = new zaun.AuthApi();
        this.userApi = new zaun.UserApi();
        this.deploymentApi = new zaun.DeploymentApi();
        this.channelApi = new zaun.ChannelApi();
        this.sessionApi = new zaun.SessionApi();
        this.cachesApi = new zaun.CachesApi();
    }
}