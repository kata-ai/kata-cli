"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const Table = require("cli-table");
class Channel {
    constructor(helper, api, config) {
        this.helper = helper;
        this.api = api;
        this.config = config;
    }
    addChannel(environmentId, channelName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            try {
                // add chnnel/environmentchannel
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet, projectId, environmentId, {});
                const channels = body;
                const channelWithSameName = channels.find((row) => row.name === channelName);
                if (channelWithSameName) {
                    throw new Error("CHANNEL NAME HAS BEEN USED");
                }
                if (!options.data) {
                    options.data = "{}";
                }
                let channelData = JSON.parse(options.data);
                channelData.name = channelName;
                channelData = yield this.inquireChannelData(channelData);
                const result = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsPost, projectId, environmentId, channelData);
                console.log(result.response.body);
                const channel = result.response.body;
                console.log("CHANNEL ADDED SUCCESSFULLY");
                console.log(`Paste this url to ${channelData.type} webhook : ${channel.webhook}`);
                if (channelData.type === "fbmessenger") {
                    const channelOptions = JSON.parse(channel.options);
                    console.log(`And also this token : ${channelOptions.challenge} to your FB Challenge token.`);
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    list(environmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            try {
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsGet, projectId, environmentId, {});
                if (body) {
                    const table = new Table({
                        head: ["Channel Name", "Channel Type", "Channel ID"],
                        colWidths: [30, 30, 42]
                    });
                    body.forEach((channel) => {
                        table.push([channel.name, channel.type, channel.id]);
                    });
                    console.log(table.toString());
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    removeChannel(environmentId, channelName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            try {
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdGet, environmentId, projectId);
                const deployment = body;
                const channels = deployment.channels;
                const channel = channels.find((row) => row.name === channelName);
                if (!channel) {
                    throw new Error("CHANNEL NOT FOUND");
                }
                console.log(channel);
                yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdChannelsChannelIdDelete, projectId, environmentId, channel.id);
                console.log("CHANNEL REMOVED SUCCESSFULLY");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    inquireChannelData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, name, type, token, refreshToken, secret, url, additionalOptions } = data;
            const channelType = this.config.default("config.channels.type", []);
            const channelUrl = this.config.default("config.channels.url", []);
            const answer = yield inquirer.prompt([
                {
                    type: "list",
                    name: "type",
                    message: `channel type : `,
                    choices: channelType,
                    when: () => !type,
                    validate: (type) => {
                        if (!type) {
                            return "Channel type cannot be empty";
                        }
                        return true;
                    },
                    filter: (type) => {
                        return type.toLowerCase();
                    }
                },
                {
                    type: "input",
                    name: "options.token",
                    message: "channel token: ",
                    when: () => !token,
                    filter(token) {
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
                    filter(refreshToken) {
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
                    filter(secret) {
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
                    filter(additionalOptions) {
                        if (!additionalOptions || additionalOptions.length === 0) {
                            return null;
                        }
                        try {
                            const result = JSON.parse(additionalOptions);
                            if (typeof result === "object") {
                                return result;
                            }
                            else {
                                return { error: true };
                            }
                        }
                        catch (error) {
                            return { error };
                        }
                    },
                    validate(additionalOptions) {
                        if (!additionalOptions) {
                            return true;
                        }
                        if (additionalOptions.error) {
                            return "Channel options must be a JSON Format";
                        }
                        else {
                            return true;
                        }
                    }
                },
                {
                    type: "input",
                    name: "url",
                    message(answer) {
                        if (answer.type !== "generic") {
                            return `channel api url (default: ${channelUrl[answer.type]}) :`;
                        }
                        return "channel api url : ";
                    },
                    when() { return !url; },
                    validate(url, answer) {
                        if (!url && answer.type === "generic") {
                            return "Channel api url cannot be empty";
                        }
                        return true;
                    },
                    default: (answer) => {
                        return channelUrl[answer.type];
                    }
                }
            ]);
            let options = { token, refreshToken, secret, };
            if (additionalOptions) {
                options = Object.assign({}, options, additionalOptions);
            }
            const res = { id, name, type, options, url };
            try {
                answer.options = Object.assign(answer.options, answer.additionalOptions);
                answer.additionalOptions = undefined;
            }
            catch (error) {
                //
            }
            return Object.assign({}, res, answer);
        });
    }
}
exports.default = Channel;
//# sourceMappingURL=channel.js.map