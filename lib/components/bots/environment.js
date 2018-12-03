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
class Environment {
    constructor(helper, api) {
        this.helper = helper;
        this.api = api;
    }
    create(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            const postBody = {
                depId: projectId,
                name: "Development",
                depVersion: "0.0.1",
                slug
            };
            try {
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
            const projectId = this.helper.getProjectId();
            try {
                // list bot/project deployment, this.api.deploymentApi.projectsProjectIdEnvironmentsGet
                // console.log(this.api.deploymentApi.projectsProjectIdEnvironmentsGet.toString())
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, {});
                if (body && body.data) {
                    const table = new Table({
                        head: ["Environment Name", "Environment Slug", "Environment ID", "Deployment Version",],
                        colWidths: [30, 30, 42, 30]
                    });
                    body.data.forEach((environment) => {
                        table.push([environment.name, String(environment.slug), environment.id, environment.depVersion]);
                    });
                    console.log(table.toString());
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    update(name, label, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const environmentId = "";
        });
    }
}
exports.default = Environment;
//# sourceMappingURL=environment.js.map