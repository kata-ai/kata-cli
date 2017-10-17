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
const path = require("path");
class Session extends merapi_1.Component {
    constructor(helper, api) {
        super();
        this.helper = helper;
        this.api = api;
        this.defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";
    }
    get(id, deploymentId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let botId = this.helper.getBotId();
            try {
                deploymentId = deploymentId || this.defaultDeploymentId;
                let { data } = yield this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, deploymentId, id, "");
                console.dir(data, { depth: null });
            }
            catch (e) {
                this.helper.wrapError(e);
            }
        });
    }
    create(id, deploymentId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let botId = this.helper.getBotId();
            try {
                let session;
                if (options.data) {
                    session = JSON.parse(options.data);
                }
                else if (options.file) {
                    session = this.helper.loadYamlOrJsonFile(options.file);
                }
                if (id && !session.id)
                    session.id = id;
                deploymentId = deploymentId || this.defaultDeploymentId;
                let { data } = yield this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsPost, botId, deploymentId, session);
                console.log(data);
                console.log("Session created successfully");
            }
            catch (e) {
                this.helper.wrapError(e);
            }
        });
    }
    update(id, deploymentId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let botId = this.helper.getBotId();
            try {
                let session;
                if (options.data) {
                    session = JSON.parse(options.data);
                }
                else if (options.file) {
                    session = this.helper.loadYamlOrJsonFile(options.file);
                }
                if (!session.id)
                    session.id = id;
                deploymentId = deploymentId || this.defaultDeploymentId;
                let { data } = yield this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut, botId, deploymentId, id, session);
                console.log(data);
                console.log("Session updated successfully");
            }
            catch (e) {
                this.helper.wrapError(e);
            }
        });
    }
    delete(id, deploymentId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let botId = this.helper.getBotId();
            try {
                deploymentId = deploymentId || this.defaultDeploymentId;
                let { data } = yield this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete, botId, deploymentId, id);
                console.dir(data, { depth: null });
                console.log("Session deleted successfully");
            }
            catch (e) {
                this.helper.wrapError(e);
            }
        });
    }
    timestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            let { response } = yield this.helper.toPromise(this.api.utilApi, this.api.utilApi.timestampGet);
            console.log(`Current server timestamp: ${response.text}`);
        });
    }
}
exports.default = Session;
//# sourceMappingURL=session.js.map