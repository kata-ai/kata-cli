
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import { v4 as uuid } from "uuid";
import { IHelper } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");

export default class Deployment extends Component {
    constructor(private helper: IHelper, private api: any, private config: Config) {
        super();
    }

    public async deploy(name: string, label: string, options: JsonObject) {
        let deployment;
        const bot = this.helper.getBotId();
        const versionRegex = /^\d+\.\d+\.\d+$/g;
        let tag: string = "";
        let version: string = "";

        try {
            const { data } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, bot);
            const history = data.versions;

            if (label) {
                const isVersion = versionRegex.test(label);
                const latestTag = history.data.filter((x: JsonObject) => {
                    const cond = isVersion ? x.version : x.tag;

                    return label === cond;
                });

                if (latestTag.length > 0) {
                    const selectedBot = latestTag[latestTag.length - 1];
                    version = selectedBot.version;
                    tag = isVersion ? selectedBot.tag ? selectedBot.tag : null : label;
                } else {
                    throw new Error("INVALID TAG");
                }
            } else {
                version = data.latest;
                tag = "latest";
            }


            if (!history.data.some((v: JsonObject) => v.version === version)) {
                throw new Error("INVALID_VERSION");
            }


        } catch (e) {
            console.log(this.helper.wrapError(e));
            return;
        }

        try {
            const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);

            deployment = data;
        } catch (e) {
            if (e.status !== 400) {
                console.log(this.helper.wrapError(e));

                return;
            }
        }

        try {
            if (!deployment) {
                const opts = {
                    body: {
                        name,
                        botVersion: version,
                        channels: {}
                    }
                };

                const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsPost, bot, opts);

                console.log("DEPLOYMENT CREATED SUCCESSFULLY");
                console.dir({ ...data, tag }, { depth: null });
            } else {
                const body = {
                    name,
                    botVersion: version
                };

                const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdPut, bot, name, body);

                console.log("DEPLOYMENT UPDATED SUCCESSFULLY");
                console.dir({ ...data, tag }, { depth: null });
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async list(options: JsonObject) {
        try {
            const botId = this.helper.getBotId();
            const { response } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsGet, botId, {});

            if (response && response.body) {
                const table = new Table({
                    head: ["Deployment Name", "Version"],
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

    public async addChannel(name: string, channelName: string, options: JsonObject) {
        try {
            const bot = this.helper.getBotId();
            let result = await this.helper.toPromise(
                this.api.deploymentApi,
                this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet,
                bot, name);
            const deployment = result.data;

            if (deployment.channels[channelName]) {
                throw new Error("CHANNEL NAME HAS BEEN USED");
            }

            if (!options.data) {
                options.data = "{}";
            }

            let channelData = JSON.parse(options.data as string) as JsonObject;
            channelData.name = channelName;
            channelData = await this.getRequiredChannelData(channelData);

            result = await this.helper.toPromise(
                this.api.channelApi,
                this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsPost,
                channelData,
                bot,
                name
            );
            const channel = result.data;

            deployment.channels[channelName] = channel.id;

            console.log("CHANNEL ADDED SUCCESSFULLY");
            console.log(`Paste this url to ${channelData.type} webhook : ${channel.webhook}`);
            if (channelData.type === "fbmessenger") {
                const channelOptions = JSON.parse(channel.options as string) as JsonObject;
                console.log(`And also this token : ${channelOptions.challenge} to your FB Challenge token.`);
            }

        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async removeChannel(name: string, channelName: string, options: JsonObject) {
        const bot = this.helper.getBotId();

        try {
            const result = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
            const deployment = result.data;

            if (!deployment.channels[channelName]) {
                throw new Error("CHANNEL NOT FOUND");
            }

            await this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete, bot, name, deployment.channels[channelName]);

            console.log("CHANNEL REMOVED SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async drop(name: string, options: JsonObject) {
        const bot = this.helper.getBotId();

        try {
            const result = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdDelete, bot, name);
            const deployment = result.data;

            console.log(deployment);
            console.log("DEPLOYMENT DELETED SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    private async getRequiredChannelData(data: JsonObject): Promise<JsonObject> {
        const { id, name, type, token, refreshToken, secret, url, additionalOptions } = data;
        const channelType = this.config.default("config.channels.type", []);
        const channelUrl = this.config.default("config.channels.url", []);
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "type",
                message: `channel type : `,
                choices: channelType,
                when: () => !type,
                validate: (type: string) => {
                    if (!type) {
                        return "Channel type cannot be empty";
                    }
                    return true;
                },
                filter: (type: string) => {
                    return type.toLowerCase();
                }
            },
            {
                type: "input",
                name: "options.token",
                message: "channel token: ",
                when: () => !token,
                filter(token: string) {
                    if (!token || token.length === 0) {
                        return null;
                    }

                    return token;
                }
            },
            {
                type: "input",
                name: "options.refreshToken",
                message: "channel refresh token: ",
                when: () => !refreshToken,
                filter(refreshToken: string) {
                    if (!refreshToken || refreshToken.length === 0) {
                        return null;
                    }

                    return refreshToken;
                }
            },
            {
                type: "input",
                name: "options.secret",
                message: "channel secret key: ",
                when() { return !secret; },
                filter(secret: string) {
                    if (!secret || secret.length === 0) {
                        return null;
                    }

                    return secret;
                }
            },
            {
                type: "input",
                name: "additionalOptions",
                message: "channel additional options: ",
                when() { return !additionalOptions; },
                filter(additionalOptions: string): JsonObject {
                    if (!additionalOptions || additionalOptions.length === 0) {
                        return null;
                    }
                    try {
                        const result = JSON.parse(additionalOptions);
                        if (typeof result === "object") {
                            return result;
                        } else {
                            return { error: true };
                        }
                    } catch (error) {
                        return { error };
                    }
                },
                validate(additionalOptions: JsonObject) {
                    if (!additionalOptions) {
                        return true;
                    }
                    if (additionalOptions.error) {
                        return "Channel options must be a JSON Format";
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "url",
                message(answer: JsonObject) {
                    if (answer.type !== "generic") {
                        return `channel api url (default: ${channelUrl[answer.type as any]}) :`;
                    }

                    return "channel api url : ";
                },
                when() { return !url; },
                validate(url: string, answer: JsonObject) {
                    if (!url && answer.type === "generic") {
                        return "Channel api url cannot be empty";
                    }

                    return true;
                },
                default: (answer: JsonObject) => {
                    return channelUrl[answer.type as any];
                }
            }

        ]);

        let options = { token, refreshToken, secret };

        if (additionalOptions) {
            options = { ...options, ...additionalOptions as JsonObject };
        }

        const res = { id, name, type, options, url };
        try {
            answer.options = Object.assign(answer.options, answer.additionalOptions);
            answer.additionalOptions = undefined;
        } catch (error) {
            //
        }
        return { ...res, ...answer };
    }
}
