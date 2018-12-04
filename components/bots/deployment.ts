
import { IHelper } from "interfaces/main";
import { JsonObject } from "merapi";
const Table = require("cli-table");

export default class Deployment {
    constructor(private helper: IHelper, private api: any) {
    }

    public async create() {
        const projectId = this.helper.getProjectId();
        const { response: { body: project } } = await this.helper.toPromise(
            this.api.projectApi, this.api.projectApi.projectsProjectIdGet,
            projectId
        );

        const { response: { body: latestDeployment } } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdDeploymentGet, projectId);
        const prevVersion = latestDeployment.version;
        const [major, minor, patch] = prevVersion.split(".");
        const updatedPatch = Number(patch) + 1;
        const targetVersion = `${major}.${minor}.${updatedPatch}`;
        
        try {
            const postBody = {
                version: targetVersion,
                botRevision: project.botLatestRevision,
                modules: (null as any),
            };

            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost,
                postBody, projectId,
            );
            
            console.log(`Succesfully create Deployment to version ${targetVersion}`);
        } catch (e) {
            console.error("Error");
            console.log(this.helper.wrapError(e));
        }
    }

    public async list(options: JsonObject) {
        const projectId = this.helper.getProjectId();

        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsGet, projectId, {}
            );

            if (body && body.data) {
                const table = new Table({
                    head: ["Deployment Name", "Deployment Version", "Bot Revision"],
                    colWidths: [30, 30, 42]
                });
                body.data.forEach((deployment: JsonObject) => {
                    table.push([deployment.name, deployment.version, deployment.botRevision]);
                });

                console.log(table.toString());
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }
}
