
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IUtils, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const path = require("path");

export default class Session extends Component {
    constructor(private compile : ICompile, private utils: IUtils, private tester: ITester, private api: any) {
        super();
    }

    async get(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.utils.getBotId();
        
        try {
            deploymentId = deploymentId || "depId";
            let {data} = await this.utils.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDepIdSessionsSessionIdGet, botId, deploymentId, id);

            console.log(data);
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async create(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.utils.getBotId();

        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(<string>options.data);
            }
            else if (options.file) {
                session = this.utils.loadYamlOrJsonFile(<string>options.file);
            }

            if (id && !session.id)
                session.id = id;
            
            deploymentId = deploymentId || "depId";

            let {data} = await this.utils.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDepIdSessionsPost, botId, deploymentId, session);

            console.log(data);
            console.log("Session created successfully");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;

            console.log(errorMessage);
        }
    }

    async update(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.utils.getBotId();
        
        try {
            let session : JsonObject;

            if (options.data) {
                session = JSON.parse(<string>options.data);
            }
            else if (options.file) {
                session = this.utils.loadYamlOrJsonFile(<string>options.file);
            }

            if (!session.id)
                session.id = id;
            
            deploymentId = deploymentId || "depId";

            let {data} = await this.utils.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDepIdSessionsSessionIdPut, botId, deploymentId, id, session);

            console.log(data);
            console.log("Session updated successfully");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;

            console.log(errorMessage);
        }
    }

    async delete(id: string, deploymentId: string, options: JsonObject) {
        let botId = this.utils.getBotId();
        
        try {
            let {data} = await this.utils.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDepIdSessionsSessionIdDelete, botId, deploymentId, id);

            console.log(data);
            console.log("Session deleted successfully");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }
}