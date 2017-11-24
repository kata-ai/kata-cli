
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import { v4 as uuid } from "node-uuid";
import { IHelper } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");

export default class Deployment extends Component {
    constructor(private helper: IHelper, private api: any, private config: Config) {
        super();
    }

    async deploy(name: string, label: string, options: JsonObject) {
        let deployment;
        let bot = this.helper.getBotId();
        let versionRegex = /^\d+\.\d+\.\d+$/g;
        let tag: string = "";
        let version: string = "";

        try {
            let { data } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, bot);

            if (label) {
                let isVersion = versionRegex.test(label);
                let latestTag = data.versions.filter((x: any) => {
                    let splited = x.split("-");
                    let cond = isVersion ? splited[0] : splited[1];

                    return label === cond;
                });

                if (latestTag.length > 0) {
                    let splited = latestTag[latestTag.length - 1].split("-");
                    version = splited[0];
                    tag = isVersion ? splited[1] ? splited[1] : null : label;
                }

                else
                    throw new Error("INVALID TAG");
            } else {
                version = data.latest;
                tag = "latest";
            }


            if (!data.versions.some((v: string) => v.split("-")[0] === version))
                throw new Error("INVALID_VERSION");


        } catch (e) {
            console.log(this.helper.wrapError(e));
            return;
        }

        try {
            let { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);

            deployment = data;
        } catch (e) {
            let errorMessage = this.helper.wrapError(e);

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

                let { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsPost, bot, opts);

                console.log("DEPLOYMENT CREATED SUCCESSFULLY");
                console.dir({ ...data, tag: tag }, { depth: null });
            }
            else {
                let body = {
                    name,
                    botVersion: version
                };

                let { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdPut, bot, name, body);

                console.log("DEPLOYMENT UPDATED SUCCESSFULLY");
                console.dir({ ...data, tag: tag }, { depth: null });
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    async list(options: JsonObject) {
        try {
            let botId = this.helper.getBotId();
            let { response } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsGet, botId, {});

            if (response && response.body) {
                let table = new Table({
                    head: ['Deployment Name', 'Version'],
                    colWidths: [30, 10]
                });
                response.body.forEach((deployment: JsonObject) => {
                    table.push([deployment.name, deployment.botVersion]);
                });
                console.log(table.toString());
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
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

            let channelData = <JsonObject>JSON.parse(<string>options.data);
            channelData.name = channelName;
            channelData = await this.getRequiredChannelData(channelData);

            result = await this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsPost, channelData, bot, name);
            let channel = result.data;

            deployment.channels[channelName] = channel.id;
            
            console.log("CHANNEL ADDED SUCCESSFULLY");
            console.log(`Paste this url to ${channelData.type} webhook : ${channel.webhook}`);
        } catch (e) {
            console.log(this.helper.wrapError(e));
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
            console.log(this.helper.wrapError(e));
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
            console.log(this.helper.wrapError(e));
        }
    }

    private async getRequiredChannelData(data: JsonObject): Promise<JsonObject> {
        let { id, name, type, token, refreshToken, secret, url, additionalOptions } = data;
        let channelType = this.config.default("config.channels.type", []);
        let channelUrl = this.config.default("config.channels.url", []);
        let answer = await inquirer.prompt([
            {
                type: "list",
                name: "type",
                message: `channel type : `,
                choices: channelType,
                when: function () { return !type; },
                validate: function (type: string) {
                    if (!type)
                        return "Channel type cannot be empty";

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
                when: function () { return !token; },
                filter: function (token: string) {
                    if (!token || token.length === 0)
                        return null;

                    return token;
                }
            },
            {
                type: "input",
                name: "options.refreshToken",
                message: "channel refresh token: ",
                when: function () { return !refreshToken },
                filter: function (refreshToken: string) {
                    if (!refreshToken || refreshToken.length === 0)
                        return null;

                    return refreshToken;
                }
            },
            {
                type: "input",
                name: "options.secret",
                message: "channel secret key: ",
                when: function () { return !secret },
                filter: function (secret: string) {
                    if (!secret || secret.length === 0)
                        return null;

                    return secret;
                }
            },
            {
                type: "input",
                name: "additionalOptions",
                message: "channel additional options: ",
                when: function () { return !additionalOptions },
                filter: function (additionalOptions: string): JsonObject {
                    if (!additionalOptions || additionalOptions.length === 0)
                        return null;
                    try {
                        let result = JSON.parse(additionalOptions);
                        if (typeof result === "object")
                            return result;
                        else {
                            return { error: true };
                        }
                    } catch (error) {
                        return { error: error };
                    }
                },
                validate: function (additionalOptions: JsonObject) {
                    if (!additionalOptions) {
                        return true;
                    }
                    if (additionalOptions.error) {
                        return "Channel options must be a JSON Format"
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "url",
                message: function (answer: JsonObject) {
                    if (answer.type !== "generic")
                        return `channel api url (default: ${channelUrl[answer.type as any]}) :`;

                    return "channel api url : ";
                },
                when: function () { return !url },
                validate: function (url: string, answer: JsonObject) {
                    if (!url && answer.type === "generic")
                        return "Channel api url cannot be empty";

                    return true;
                },
                default: function (answer: JsonObject) {
                    return channelUrl[answer.type as any];
                }
            }

        ]);

        let options = { token, refreshToken, secret };

        if (additionalOptions)
            options = { ...options, ...additionalOptions as JsonObject };
        let res = { id, name, type, options, url };
        try {
            answer.options = Object.assign(answer.options, answer.additionalOptions);
            answer.additionalOptions = undefined;
        } catch (error) {
            //
        }
        return { ...res, ...answer };
    }
}