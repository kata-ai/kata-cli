
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const path = require("path");

export default class Session extends Component {
    private defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    async get(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.helper.getBotId();
        
        try {
            deploymentId = deploymentId || this.defaultDeploymentId;
            let {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, deploymentId, id, "");

            console.dir(data, { depth: null });
        } catch (e) {
            this.helper.wrapError(e);
        }
    }

    async create(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.helper.getBotId();

        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(<string>options.data);
            }
            else if (options.file) {
                session = this.helper.loadYamlOrJsonFile(<string>options.file);
            }

            if (id && !session.id)
                session.id = id;
            
            deploymentId = deploymentId || this.defaultDeploymentId;

            let {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsPost, botId, deploymentId, session);

            console.log(data);
            console.log("Session created successfully");
        } catch (e) {
            this.helper.wrapError(e);
        }
    }

    async update(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.helper.getBotId();
        
        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(<string>options.data);
            }
            else if (options.file) {
                session = this.helper.loadYamlOrJsonFile(<string>options.file);
            }

            if (!session.id)
                session.id = id;
            
            deploymentId = deploymentId || this.defaultDeploymentId;

            let {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut, botId, deploymentId, id, session);

            console.log(data);
            console.log("Session updated successfully");
        } catch (e) {
            this.helper.wrapError(e);
        }
    }

    async delete(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.helper.getBotId();
        
        try {
            deploymentId = deploymentId || this.defaultDeploymentId;
            let {data} = await this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete, botId, deploymentId, id);

            console.dir(data, { depth: null });
            console.log("Session deleted successfully");
        } catch (e) {
            this.helper.wrapError(e);
        }
    }
}