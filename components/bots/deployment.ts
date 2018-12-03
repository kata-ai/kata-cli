
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

        try {
            // const { response: { body: deployments } } = await this.helper.toPromise(
            //     this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentsVersionsVersionGet,
            //     projectId

            // );
            // console.log(deployments)

            const postBody = {
                version: "0.0.1",
                botRevision: project.botLatestRevision,
                modules: (null as any),
            };
            console.log(postBody)



            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost,
                postBody, projectId,
            );

            console.log(body);
            console.log("DEPLOYMENT CREATED SUCCESSFULLY");
        } catch (e) {
            console.error("Error")
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
