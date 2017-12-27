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
const merapi_1 = require("merapi");
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");
class Deployment extends merapi_1.Component {
    constructor(helper, api, config) {
        super();
        this.helper = helper;
        this.api = api;
        this.config = config;
    }
    deploy(name, label, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let deployment;
            let bot = this.helper.getBotId();
            let versionRegex = /^\d+\.\d+\.\d+$/g;
            let tag = "";
            let version = "";
            try {
                let { data } = yield this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, bot);
                if (label) {
                    let isVersion = versionRegex.test(label);
                    let latestTag = data.versions.filter((x) => {
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
                }
                else {
                    version = data.latest;
                    tag = "latest";
                }
                if (!data.versions.some((v) => v.split("-")[0] === version))
                    throw new Error("INVALID_VERSION");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
                return;
            }
            try {
                let { data } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
                deployment = data;
            }
            catch (e) {
                if (e.status !== 400) {
                    console.log(this.helper.wrapError(e));
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
                    };
                    let { data } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsPost, bot, opts);
                    console.log("DEPLOYMENT CREATED SUCCESSFULLY");
                    console.dir(Object.assign({}, data, { tag: tag }), { depth: null });
                }
                else {
                    let body = {
                        name,
                        botVersion: version
                    };
                    let { data } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdPut, bot, name, body);
                    console.log("DEPLOYMENT UPDATED SUCCESSFULLY");
                    console.dir(Object.assign({}, data, { tag: tag }), { depth: null });
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    list(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let botId = this.helper.getBotId();
                let { response } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsGet, botId, {});
                if (response && response.body) {
                    let table = new Table({
                        head: ['Deployment Name', 'Version'],
                        colWidths: [30, 10]
                    });
                    response.body.forEach((deployment) => {
                        table.push([deployment.name, deployment.botVersion]);
                    });
                    console.log(table.toString());
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    addChannel(name, channelName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bot = this.helper.getBotId();
                let result = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
                const deployment = result.data;
                if (deployment.channels[channelName]) {
                    throw new Error("CHANNEL NAME HAS BEEN USED");
                }
                if (!options.data) {
                    options.data = "{}";
                }
                let channelData = JSON.parse(options.data);
                channelData.name = channelName;
                channelData = yield this.getRequiredChannelData(channelData);
                result = yield this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsPost, channelData, bot, name);
                const channel = result.data;
                deployment.channels[channelName] = channel.id;
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
    removeChannel(name, channelName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let bot = this.helper.getBotId();
            try {
                let result = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, bot, name);
                let deployment = result.data;
                if (!deployment.channels[channelName])
                    throw new Error("CHANNEL NOT FOUND");
                yield this.helper.toPromise(this.api.channelApi, this.api.channelApi.botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete, bot, name, deployment.channels[channelName]);
                console.log("CHANNEL REMOVED SUCCESSFULLY");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    drop(name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let bot = this.helper.getBotId();
            try {
                let result = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdDelete, bot, name);
                let deployment = result.data;
                console.log(deployment);
                console.log("DEPLOYMENT DELETED SUCCESSFULLY");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    getRequiredChannelData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, name, type, token, refreshToken, secret, url, additionalOptions } = data;
            let channelType = this.config.default("config.channels.type", []);
            let channelUrl = this.config.default("config.channels.url", []);
            let answer = yield inquirer.prompt([
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
                    filter: function (token) {
                        if (!token || token.length === 0)
                            return null;
                        return token;
                    }
                },
                {
                    type: "input",
                    name: "options.refreshToken",
                    message: "channel refresh token: ",
                    when: () => !refreshToken,
                    filter: function (refreshToken) {
                        if (!refreshToken || refreshToken.length === 0)
                            return null;
                        return refreshToken;
                    }
                },
                {
                    type: "input",
                    name: "options.secret",
                    message: "channel secret key: ",
                    when: function () { return !secret; },
                    filter: function (secret) {
                        if (!secret || secret.length === 0)
                            return null;
                        return secret;
                    }
                },
                {
                    type: "input",
                    name: "additionalOptions",
                    message: "channel additional options: ",
                    when: function () { return !additionalOptions; },
                    filter: function (additionalOptions) {
                        if (!additionalOptions || additionalOptions.length === 0)
                            return null;
                        try {
                            let result = JSON.parse(additionalOptions);
                            if (typeof result === "object")
                                return result;
                            else {
                                return { error: true };
                            }
                        }
                        catch (error) {
                            return { error: error };
                        }
                    },
                    validate: function (additionalOptions) {
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
                    message: function (answer) {
                        if (answer.type !== "generic")
                            return `channel api url (default: ${channelUrl[answer.type]}) :`;
                        return "channel api url : ";
                    },
                    when: function () { return !url; },
                    validate: function (url, answer) {
                        if (!url && answer.type === "generic")
                            return "Channel api url cannot be empty";
                        return true;
                    },
                    default: (answer) => {
                        return channelUrl[answer.type];
                    }
                }
            ]);
            let options = { token, refreshToken, secret };
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
exports.default = Deployment;
//# sourceMappingURL=deployment.js.map