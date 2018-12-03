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
const Table = require("cli-table");
class Deployment {
    constructor(helper, api) {
        this.helper = helper;
        this.api = api;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            const { response: { body: project } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdGet, projectId);
            try {
                // const { response: { body: deployments } } = await this.helper.toPromise(
                //     this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentsVersionsVersionGet,
                //     projectId
                // );
                // console.log(deployments)
                const postBody = {
                    version: "0.0.1",
                    botRevision: project.botLatestRevision,
                    modules: null,
                };
                console.log(postBody);
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost, postBody, projectId);
                console.log(body);
                console.log("DEPLOYMENT CREATED SUCCESSFULLY");
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
        });
    }
    list(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            try {
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsGet, projectId, {});
                if (body && body.data) {
                    const table = new Table({
                        head: ["Deployment Name", "Deployment Version", "Bot Revision"],
                        colWidths: [30, 30, 42]
                    });
                    body.data.forEach((deployment) => {
                        table.push([deployment.name, deployment.version, deployment.botRevision]);
                    });
                    console.log(table.toString());
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
}
exports.default = Deployment;
//# sourceMappingURL=deployment.js.map