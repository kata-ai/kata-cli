
import { IHelper } from "interfaces/main";
import { Config, JsonObject } from "merapi";
import Environment from "./environment";
import inquirer = require("inquirer");
const Table = require("cli-table");

export default class Channel {
    constructor(
        private helper: IHelper,
        private api: any,
        private config: Config,
        private environment: Environment,
    ) { }

    public async addChannel(channelName: string, options: JsonObject) {
        const projectId = this.helper.getProjectId();
        const environmentId = await this.environment.askEnvironmentId();

        try {
            const { response: { body: channelsBody } } = await this.helper.toPromise(
                this.api.deploymentApi,
                this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet,
                projectId, environmentId, {},
            );

            const channels: { name: string; id: string }[] = channelsBody;
            const channelWithSameName = channels.find((row) => row.name === channelName);
            if (channelWithSameName) {
                throw new Error("CHANNEL NAME HAS BEEN USED");
            }

            if (!options.data) {
                options.data = "{}";
            }

            let channelData = JSON.parse(options.data as string) as JsonObject;
            channelData.name = channelName;
            channelData = await this.inquireChannelData(channelData);

            const result = await this.helper.toPromise(
                this.api.deploymentApi,
                this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsPost,
                projectId,
                environmentId,
                channelData,
            );
            console.log(result.response.body);
            const channel = result.response.body;


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


    public async list() {
        const projectId = this.helper.getProjectId();
        const environmentId = await this.environment.askEnvironmentId();

        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet,
                projectId, environmentId, {}
            );

            if (!body) {
                throw Error("Failed to list Channels for this environment.");
            }

            const table = new Table({
                head: ["Channel Name", "Channel Type", "Channel ID"],
                colWidths: [30, 30, 42]
            });

            body.forEach((channel: JsonObject) => {
                table.push([channel.name, channel.type, channel.id]);
            });
            console.log(table.toString());

        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }


    public async removeChannel(
        channelName: string, options: JsonObject
    ) {
        const projectId = this.helper.getProjectId();
        const environmentId = await this.environment.askEnvironmentId();

        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdGet,
                environmentId, projectId,
            );
            const deployment = body;
            const channels: { name: string; id: string }[] = deployment.channels;

            const channel = channels.find((row) => row.name === channelName);
            if (!channel) {
                throw new Error("CHANNEL NOT FOUND");
            }
            console.log(channel);

            await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsChannelIdDelete,
                projectId, environmentId, channel.id
            );

            console.log("CHANNEL REMOVED SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    private async inquireChannelData(data: JsonObject): Promise<JsonObject> {
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

        let options = { token, refreshToken, secret, };

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

    public async updateChannel(channelName: string, options: JsonObject) {
        try {
            const projectId = this.helper.getProjectId();
            if (!projectId) {
                throw new Error("Please select project first");
            }
            
            const environmentId = await this.environment.askEnvironmentId();

            const { response: { body: channelsBody } } = await this.helper.toPromise(
                this.api.deploymentApi,
                this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet,
                projectId, environmentId, {},
            );

            const channels: { name: string; id: string }[] = channelsBody;
            if (channels.length == 0) {
                throw new Error("Channel not found");
            }

            const channelFound = channels.find((row) => row.name === channelName);
            if (!channelFound) {
                throw new Error("Channel not found");
            }

            if (!options.data) {
                options.data = "{}";
            }

            let channelData = JSON.parse(options.data as string) as JsonObject;
            channelData.name = channelName;
            channelData = await this.inquireChannelData(channelData);

            const result = await this.helper.toPromise(
                this.api.deploymentApi,
                this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsChannelIdPut,
                projectId,
                environmentId,
                channelFound.id,
                channelData,
            );
            console.log(result.response.body);
            const channel = result.response.body;

            console.log("Channel added successfully");
            console.log(`Paste this url to ${channelData.type} webhook : ${channel.webhook}`);
            if (channelData.type === "fbmessenger") {
                const channelOptions = JSON.parse(channel.options as string) as JsonObject;
                console.log(`And also this token : ${channelOptions.challenge} to your FB Challenge token.`);
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }
}
