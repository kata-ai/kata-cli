
import { IHelper } from "interfaces/main";
import { JsonObject } from "merapi";
const Table = require("cli-table");

export default class Environment {
    constructor(private helper: IHelper, private api: any) {
    }

    public async create(slug: string) {
        const projectId = this.helper.getProjectId();
        const postBody = {
            depId: projectId,
            name: "Development",
            depVersion: "0.0.1",
            slug
        };
        
        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsPost,
                projectId, postBody, 
            );

            console.log(body);
            console.log("ENVIRONMENT CREATED SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }


    public async list() {
        const projectId = this.helper.getProjectId();
        try {

            // list bot/project deployment, this.api.deploymentApi.projectsProjectIdEnvironmentsGet
            // console.log(this.api.deploymentApi.projectsProjectIdEnvironmentsGet.toString())
            const { response: { body } } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, {});

            if (body && body.data) {
                const table = new Table({
                    head: ["Environment Name", "Environment Slug", "Environment ID", "Deployment Version",],
                    colWidths: [30, 30, 42, 30]
                });
                body.data.forEach((environment: JsonObject) => {
                    table.push([environment.name, String(environment.slug), environment.id, environment.depVersion]);
                });

                console.log(table.toString());
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async update(name: string, label: string, options: JsonObject) {
        const environmentId = "";
    }

}
