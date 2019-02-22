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
class Environment {
    constructor(helper, api) {
        this.helper = helper;
        this.api = api;
    }
    create(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            if (slug.length > 20) {
                console.error("error: Slug length can not exceed 20 characters");
                return;
            }
            try {
                const deployment = yield this.getLatestDeployment();
                if (!deployment) {
                    throw Error("Deployment not found");
                }
                const name = yield this.askPredefinedEnvironmentName();
                const existEnvs = yield this.listEnvironment();
                for (const existEnv of existEnvs) {
                    if (existEnv.name.toLowerCase() === name.toLowerCase()) {
                        throw new Error("Can not create environment with same name. " +
                            "Please use command update-environment.");
                    }
                }
                const postBody = {
                    depId: projectId,
                    depVersion: deployment.version,
                    name, slug,
                };
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsPost, projectId, postBody);
                console.log(body);
                console.log("ENVIRONMENT CREATED SUCCESSFULLY");
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const environmentList = yield this.listEnvironment();
                const table = new Table({
                    head: ["Environment Name", "Environment Slug", "Environment ID", "Deployment Version"],
                    colWidths: [30, 30, 42, 30]
                });
                environmentList.forEach((environment) => {
                    table.push([environment.name, String(environment.slug), environment.id, environment.depVersion]);
                });
                console.log(table.toString());
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    askDeploymentId(prop = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            let page = 1;
            while (true) {
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsGet, projectId, {
                    page
                });
                const choices = body.data.map((row) => ({ name: `(${row.version})`, value: row.version }));
                if (body.total > body.page * body.limit) {
                    choices.push({ name: "Load More", value: -1 });
                }
                const { deploymentVersion } = yield inquirer.prompt([
                    {
                        type: "list",
                        name: "deploymentVersion",
                        message: prop.message || "Select Deployment:",
                        paginated: false,
                        choices
                    },
                ]);
                if (deploymentVersion === -1) {
                    page++;
                    continue;
                }
                return deploymentVersion;
            }
        });
    }
    update(newDeploymentVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            if (!newDeploymentVersion) {
                newDeploymentVersion = yield this.askDeploymentId();
            }
            if (!/[0-9]+\.[0-9]+\.[0-9]+/.test(newDeploymentVersion)) {
                console.error("error: Deployment version must be in the format of <0-9>.<0-9>.<0-9>");
                return;
            }
            const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsGet, projectId, { limit: 1000000 });
            if (!body.data.find((data) => data.version === newDeploymentVersion)) {
                console.error(`error: There are no deployment with version ${newDeploymentVersion}`);
                return;
            }
            try {
                const environmentId = yield this.askEnvironmentId({
                    message: "Select which Environment to update: "
                });
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdPut, environmentId, projectId, { depVersion: newDeploymentVersion });
                if (!body) {
                    throw Error("Error updating Environment");
                }
                return console.log(body);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    askEnvironmentId(prop = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const environmentList = yield this.listEnvironment();
            const choices = environmentList.map((row) => ({ name: `${row.name} (${row.depVersion})`, value: row.id }));
            const { environmentId } = yield inquirer.prompt([
                {
                    type: "list",
                    name: "environmentId",
                    message: prop.message || "Select Environment:",
                    paginated: false,
                    choices
                },
            ]);
            return environmentId;
        });
    }
    askPredefinedEnvironmentName() {
        return __awaiter(this, void 0, void 0, function* () {
            const environmentNames = ["Development", "Production", "Staging"];
            const choices = environmentNames.map((name) => ({ name, value: name }));
            const { environmentName } = yield inquirer.prompt([
                {
                    type: "list",
                    name: "environmentName",
                    message: "Which Environment to create?",
                    paginated: false,
                    choices
                },
            ]);
            return environmentName;
        });
    }
    getLatestDeployment() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdDeploymentGet, projectId);
            return response && response.body;
        });
    }
    listEnvironment() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProp("projectId");
            const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, {});
            if (!body || !body.data) {
                throw Error("Failed to list environments.");
            }
            return body.data;
        });
    }
}
exports.default = Environment;
//# sourceMappingURL=environment.js.map