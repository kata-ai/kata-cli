
import Api from "components/api/api";
import { IHelper } from "interfaces/main";
import { JsonObject } from "merapi";
import inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors/safe");

export default class Project {
    constructor(
        private api: Api,
        private helper: IHelper,
    ) { }

    public async create() {
        const projectData = await this.helper.inquirerPrompt([
            {
                type: "text",
                name: "name",
                message: "Project name:",
            },
        ]);
        const inquiredOptions = await this.helper.inquirerPrompt([
            {
                type: "number",
                name: "timezone",
                message: "Timezone (UTC)",
                default: 7,
            },
            {
                type: "text",
                name: "description",
                message: "Project description:",
            },
        ]);
        const options = { bot: true, cms: true, nlu: true, ...inquiredOptions };

        let nluOptions: any = {};
        if (options.nlu) {
            nluOptions = await this.helper.inquirerPrompt([
                {
                    type: "text",
                    name: "nluLang",
                    message: "NLU Language",
                    default: "id",
                },
                {
                    type: "confirm",
                    name: "privateNlu",
                    message: "Is private Nlu?",
                    default: true,
                },
            ]);
            nluOptions.nluVisibility = nluOptions.privateNlu ? "private" : "public";
            delete nluOptions.privateNlu;
        }

        const requestBody = { ...projectData, options: { ...options, ...nluOptions } };

        try {
            const { response } = await this.helper.toPromise(
                this.api.projectApi, this.api.projectApi.projectsPost, requestBody
            );

            if (response && response.body && response.body.id) {
                const project = response.body;
                const projectId = project.id;
                this.helper.setProp("projectId", projectId);
                console.log(colors.green(`Project "${project.name}" (${projectId}) is successfully created`));
                return;
            }

        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

    public async list() {
        try {
            const { response } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, {});

            if (response && response.body && response.body.data) {
                const table = new Table({
                    head: ["Project ID", "Project Name"],
                    colWidths: [38, 32]
                });
                response.body.data.forEach((project: JsonObject) => {
                    table.push([project.id, project.name]);
                });
                console.log(table.toString());
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

    public async select() {
        try {
            const { response } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, { limit: 50 });

            if (response && response.body && response.body.data) {
                const projectList: object[] = response.body.data;
                const choices = projectList.map((projectRow: any) => ({ name: projectRow.name, value: projectRow }));
                const { project } = await inquirer.prompt<any>([
                    {
                        type: "list",
                        name: "project",
                        message: "Select project:",
                        paginated: true,
                        choices
                    },
                ]);
                this.helper.setProp("projectId", project.id);
                this.helper.setProp("projectName", project.name);
                console.log(colors.green(`Project "${project.name}" (${project.id}) is successfully selected`));
                return;
            }
            console.error("Failed to list projects");

        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

}
