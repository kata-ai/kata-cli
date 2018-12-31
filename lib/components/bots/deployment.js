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
    create(versionType) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProjectId();
            const { response: { body: project } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdGet, projectId);
            // TODO: {page:1, limit:1}
            let botRevision;
            let nluRevision;
            let cmsRevision;
            try {
                const { response: { body: data } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdBotGet, projectId);
                if (data.revision) {
                    botRevision = data.revision;
                }
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
            try {
                const { response: { body: data } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdNluGet, projectId);
                if (data.snapshot) {
                    nluRevision = data.snapshot;
                }
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
            try {
                const { response: { body: data } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdCmsGet, projectId);
                if (data.revision) {
                    cmsRevision = data.revision;
                }
            }
            catch (e) {
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
            let targetVersion;
            try {
                // get previous deployment version
                const { response: { body: latestDeployment } } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdDeploymentGet, projectId);
                const prevVersion = latestDeployment.version;
                let [major, minor, patch] = prevVersion.split(".");
                if (versionType === "major") {
                    major = Number(major) + 1;
                    minor = 0;
                    patch = 0;
                }
                else if (versionType === "minor") {
                    minor = Number(minor) + 1;
                    patch = 0;
                }
                else {
                    patch = Number(patch) + 1;
                }
                targetVersion = `${major}.${minor}.${patch}`;
            }
            catch (e) {
                targetVersion = "0.0.1";
            }
            try {
                const postBody = {
                    version: targetVersion,
                    botRevision,
                    nluRevision,
                    cmsRevision,
                    modules: null,
                };
                const { response: { body } } = yield this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost, postBody, projectId);
                console.log(`Bot Revision: ${botRevision.substring(0, 6)}`);
                console.log(`NLU Revision: ${nluRevision.substring(0, 6)}`);
                console.log(`CMS Revision: ${cmsRevision.substring(0, 6)}`);
                console.log(`Succesfully create Deployment to version ${targetVersion}`);
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
                console.error("Error");
                console.log(this.helper.wrapError(e));
            }
        });
    }
}
exports.default = Deployment;
//# sourceMappingURL=deployment.js.map