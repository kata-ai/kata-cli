
import { IHelper } from "interfaces/main";
import { Component, JsonObject } from "merapi";

export default class Session extends Component {
    private defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";

    constructor(private helper : IHelper, private api : any) {
        super();
    }

    public async get(id : string, deploymentId : string, options : JsonObject) {
        const botId = this.helper.getBotId();
        
        try {
            deploymentId = deploymentId || this.defaultDeploymentId;
            const {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, deploymentId, id, "");

            console.dir(data, { depth: null });
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async create(id : string, deploymentId : string, options : JsonObject) {
        const botId = this.helper.getBotId();

        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(options.data as string);
            } else if (options.file) {
                session = this.helper.loadYamlOrJsonFile(options.file as string);
            }

            if (id && !session.id) {
                session.id = id;
            }
            
            deploymentId = deploymentId || this.defaultDeploymentId;

            const {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsPost, botId, deploymentId, session);

            console.log(data);
            console.log("Session created successfully");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async update(id : string, deploymentId : string, options : JsonObject) {
        const botId = this.helper.getBotId();
        
        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(options.data as string);
            } else if (options.file) {
                session = this.helper.loadYamlOrJsonFile(options.file as string);
            }

            if (!session.id) {
                session.id = id;
            }
            
            deploymentId = deploymentId || this.defaultDeploymentId;

            const {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut, botId, deploymentId, id, session);

            console.log(data);
            console.log("Session updated successfully");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async delete(id : string, deploymentId : string, options : JsonObject) {
        const botId = this.helper.getBotId();
        
        try {
            deploymentId = deploymentId || this.defaultDeploymentId;
            const {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete, botId, deploymentId, id);

            console.dir(data, { depth: null });
            console.log("Session deleted successfully");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async timestamp() {
        const { response } = await this.helper.toPromise(this.api.utilApi, this.api.utilApi.timestampGet);

        console.log(`Current server timestamp: ${response.text}`);
    }
}
