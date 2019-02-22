
import { IHelper } from "interfaces/main";
import inquirer = require("inquirer");
const Table = require("cli-table");

export default class Environment {
    constructor(
        private helper: IHelper,
        private api: any,
    ) { }

    public async create(slug: string) {
        const projectId = this.helper.getProjectId();

        if (slug.length > 20) {
            console.error("error: Namespace length can not exceed 20 characters");
            return;
        }

        try {
            const deployment = await this.getLatestDeployment();
            if (!deployment) {
                throw Error("Deployment not found");
            }

            const name = await this.askPredefinedEnvironmentName();

            const existEnvs = await this.listEnvironment();
            for (const existEnv of existEnvs) {
                if ((existEnv.name as string).toLowerCase() === name.toLowerCase()) {
                    throw new Error(
                        "Can not create environment with same name. " +
                        "Please use command update-environment.");
                }
            }

            const postBody = {
                depId: projectId,
                depVersion: deployment.version,
                name, slug,
            };

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
        try {
            const environmentList = await this.listEnvironment();

            const table = new Table({
                head: ["Environment Name", "Environment Slug", "Environment ID", "Deployment Version"],
                colWidths: [30, 30, 42, 30]
            });
            environmentList.forEach((environment) => {
                table.push([environment.name, String(environment.slug), environment.id, environment.depVersion]);
            });

            console.log(table.toString());
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async update(newDeploymentVersion: string) {
        const projectId = this.helper.getProjectId();

        try {
            const environmentId = await this.askEnvironmentId({
                message: "Select which Environment to update: "
            });

            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsEnvironmentIdPut,
                environmentId, projectId, { depVersion: newDeploymentVersion }
            );

            if (!body) {
                throw Error("Error updating Environment");
            }

            return console.log(body);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async askEnvironmentId(prop: { message?: string } = {}): Promise<string> {
        const environmentList = await this.listEnvironment();
        const choices = environmentList.map((row: any) => ({ name: `${row.name} (${row.depVersion})`, value: row.id }));

        const { environmentId } = await inquirer.prompt<any>([
            {
                type: "list",
                name: "environmentId",
                message: prop.message || "Select Environment:",
                paginated: false,
                choices
            },
        ]);
        return environmentId;
    }

    private async askPredefinedEnvironmentName(): Promise<string> {
        const environmentNames = ["Development", "Production", "Staging"];
        const choices = environmentNames.map((name) => ({ name, value: name }));

        const { environmentName } = await inquirer.prompt<any>([
            {
                type: "list",
                name: "environmentName",
                message: "Which Environment to create?",
                paginated: false,
                choices
            },
        ]);

        return environmentName;
    }

    private async getLatestDeployment() {
        const projectId = this.helper.getProjectId();

        const { response } = await this.helper.toPromise(
            this.api.projectApi, this.api.projectApi.projectsProjectIdDeploymentGet, projectId
        );

        return response && response.body;
    }

    private async listEnvironment(): Promise<any[]> {
        const projectId = this.helper.getProp("projectId");
        const { response: { body } } = await this.helper.toPromise(
            this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdEnvironmentsGet, projectId, {}
        );
        if (!body || !body.data) {
            throw Error("Failed to list environments.");
        }
        return body.data;
    }
}
