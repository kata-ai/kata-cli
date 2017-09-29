
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { IHelper } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");

export default class Deployment extends Component {
    constructor(private helper: IHelper, private api: any, private config : Config) {
        super();
    }

    async deploy(name: string, version: string, options: JsonObject) {
        let deployment;
        let bot = this.helper.getBotId();

        try {
            let {data} = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, bot);

            if (!version)
                version = data.latest;
            
            if (!data.versions.some((v: string) => v.split("-")[0] === version))
                throw new Error("INVALID_VERSION");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);

            return;
        }

        try {
            let {data} = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);

            deployment = data;
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            if (errorMessage !== "Deployment not found.") {
                console.log(errorMessage);

                return;
            }
        }

        try {
            if (!deployment) {
                let opts = {
                    body: {
                        name,
                        botVersion: version,
                        channels: {}
                    }
                }

                let {data} = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsPost, bot, opts);

                console.log("DEPLOYMENT CREATED SUCCESSFULLY");
                console.dir(data, {depth: null});
            }
            else {
                let body = {
                    name,
                    botVersion: version
                };

                let {data} = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdPut, bot, name, body);

                console.log("DEPLOYMENT UPDATED SUCCESSFULLY");
                console.dir(data, {depth: null});
            }
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async addChannel(name: string, channelName: string, options: JsonObject) {
        try {
            let bot = this.helper.getBotId();
            let result = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
            let deployment = result.data;

            if (deployment.channels[channelName])
                throw new Error("CHANNEL NAME HAS BEEN USED");

            if (!options.data)
                options.data = "{}";

            let channelData = <JsonObject> JSON.parse(<string>options.data);
            channelData.name = channelName;
            channelData = await this.getRequiredChannelData(channelData);

            result = await this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsPost, channelData, bot, name);
            let channel = result.data;

            deployment.channels[channelName] = channel.id;

            console.log("CHANNEL ADDED SUCCESSFULLY");
            console.log(deployment);
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async removeChannel(name: string, channelName: string, options: JsonObject) {
        let bot = this.helper.getBotId();

        try {
            let result = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
            let deployment = result.data;

            if (!deployment.channels[channelName])
                throw new Error("CHANNEL NOT FOUND");

            await this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete, bot, name, deployment.channels[channelName]);

            console.log("CHANNEL REMOVED SUCCESSFULLY");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    async drop(name: string, options: JsonObject) {
        let bot = this.helper.getBotId();

        try {
            let result = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdDelete, bot, name);
            let deployment = result.data;

            console.log(deployment);
            console.log("DEPLOYMENT DELETED SUCCESSFULLY");
        } catch (e) {
            let errorMessage;

            if (e.response && e.response.body && e.response.body.message)
                errorMessage = e.response.body.message;
            else
                errorMessage = e.message;
            
            console.log(errorMessage);
        }
    }

    private async getRequiredChannelData(data: JsonObject) : Promise<JsonObject> {
        let { id, name, type, token, refreshToken, secret, url } = data;
        let channelType = this.config.default("config.channels.type", []);
        let answer = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "channel name: ",
                when: function() { return !name; },
                validate: function (name: string) {
                    if (!name)
                        return "Channel name cannot be empty";
                    
                    return true;
                }
            },
            {
                type: "input",
                name: "type",
                message: `channel type (${channelType.join(", ")}): `,
                when: function() { return !type; },
                validate: function (type: string) {
                    if (!type)
                        return "Channel type cannot be empty";

                    if (channelType.indexOf(type.toLowerCase()) == -1)
                        return "Invalid type for channel";

                    return true;
                },
                filter: function (type: string) {
                    return type.toLowerCase();
                }
            },
            {
                type: "input",
                name: "options.token",
                message: "channel token: ",
                when: function() { return !token; },
                filter: function(token: string) {
                    if (!token || token.length === 0)
                        return null;
                    
                    return token;
                }
            },
            {
                type: "input",
                name: "options.refreshToken",
                message: "channel refresh token: ",
                when: function() { return !refreshToken },
                filter: function(refreshToken: string) {
                    if (!refreshToken || refreshToken.length === 0)
                        return null;
                    
                    return refreshToken;
                }
            },
            {
                type: "input",
                name: "options.secret",
                message: "channel secret key: ",
                when: function() { return !secret },
                filter: function(secret: string) {
                    if (!secret || secret.length === 0)
                        return null;
                    
                    return secret;
                }
            },
            {
                type: "input",
                name: "url",
                message: "channel api url: ",
                when: function() { return !url },
                validate: function (url: string) {
                    if (!url)
                        return "Channel api url cannot be empty";
                    
                    return true;
                }
            }
        ]);

        let options = { token, refreshToken, secret };
        let res = { id, name, type, options, url };

        return { ...res, ...answer };
    }
}