
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
        let projectData: Record<string, any> = {name : ""};
        while (true) {
          projectData = await this.helper.inquirerPrompt([
            {
              type: "text",
              name: "name",
              message: "Project name:",
            },
          ]);
          if (projectData.name.length > 20) {
              console.error("error: Project name length can not exceed 20 characters");
          }
          else if (!/^[A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$/.test(projectData.name)) {
              console.error("error: Project name must start with alphabet characters and contains only aplhanumeric character, dash, or underscore");
          }
          else {
              break;
          }
        }
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

    public async update(projectName?:string) {
        let chosen = null

        if (projectName) {
            chosen = await this.getDataByName(projectName)
        } else {
            chosen = await this.choose()
        }
        
        if (chosen) {
            const { description, privateNlu } = await this.helper.inquirerPrompt([
                {
                    type: "text",
                    name: "description",
                    message: "Project description:",
                },
                {
                    type: "confirm",
                    name: "privateNlu",
                    message: "Is private Nlu?",
                    default: true,
                }
            ]);
    
            const nluVisibility = privateNlu ? 'private' : 'public';
    
            const requestBody = {
                id: chosen.id,
                name: chosen.name,
                description: description,
                options: {
                    timezone: chosen.options.timezone,
                    nluLang: chosen.options.nluLang,
                    nluVisibility: nluVisibility,
                    nluId: chosen.options.nluId
                }
            }
            
            const { response } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdPut, chosen.id, requestBody);
            if (response && response.body) {
                console.log(`Project ${chosen.name} has been updated.`)
            } else {
                console.log("Failed when trying update project")
            }
        } else {
            console.log(`Project ${projectName} is not found`)
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

    private async getDataByName(projectName: string) {
        const { response } = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, {});

        if (response && response.body && response.body.data) {
            const projects = response.body.data
            const sameName = projects.find((project: any) => project.name === projectName);
            if (sameName) {
                return sameName
            }
        }
    }

    private async choose(){
        try {
            let page =  1;
            const pageLimit = 10;
            while (true) {
                const { response } = await this.helper.toPromise(
                    this.api.projectApi,
                    this.api.projectApi.projectsGet,
                    { limit: pageLimit, page}
                );

                if (response && response.body && response.body.data) {

                    const maxPage = Math.ceil(response.body.total / pageLimit);

                    const projectList: object[] = response.body.data;
                    const choices = projectList.map((projectRow: any) => ({
                        name: projectRow.name,
                        value: projectRow
                    }));

                    const body = response.body;

                    if (body.total > body.page * body.limit) {
                        choices.push({name: "(Load More)", value: -1});
                    }

                    const { project } = await inquirer.prompt<any>([
                        {
                            type: "list",
                            name: "project",
                            message: `Select project (page ${ page } / ${ maxPage })`,
                            paginated: false,
                            pageSize: pageLimit + 1,
                            choices
                        },
                    ]);

                    if (project === -1) {
                        page++;
                        continue;
                    }

                    return project;
                }
                console.error("Failed to list projects");
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

    public async select(projectName?: string) {
        let chosen: any;
        if (typeof projectName === "string") {
            chosen = await this.getDataByName(projectName);
            if (chosen !== undefined) {
                // project name found
                this.helper.setProp("projectId", chosen.id);
                this.helper.setProp("projectName", chosen.name);
            } else {
                // project name not found, select through inquirer
                console.log(
                    `Project with name ${colors.green(projectName)} is not found. ` +
                    `Please choose listed project name below:`);
                chosen = await this.choose()
                if (chosen) {
                    this.helper.setProp("projectId", chosen.id);
                    this.helper.setProp("projectName", chosen.name);
                }
            }
        } else {
            // projectName is empty
            chosen = await this.choose()
            if (chosen) {
                this.helper.setProp("projectId", chosen.id);
                this.helper.setProp("projectName", chosen.name);
            }
        }
        console.log(colors.green(`Project "${ chosen.name }" (${ chosen.id }) is successfully selected`));

        if (!chosen || chosen === undefined) {
            chosen = await this.choose()
            if (chosen) {
                this.helper.setProp("projectId", chosen.id);
                this.helper.setProp("projectName", chosen.name);
                console.log(colors.green(`Project "${ chosen.name }" (${ chosen.id }) is successfully selected`));
            }
        }

        
    }

    public async delete(projectName?: string) {
        try {
            const chosen = projectName ? await this.getDataByName(projectName) : await this.choose()
            if (chosen) {
                const { yes } = await inquirer.prompt<any>([
                    {
                        type: "confirm",
                        name: "yes",
                        message: "Are you sure want to delete this project ?",
                        default: true,
                    }
                ]);

                if (yes) {
                    const deleteProject = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdDelete, chosen.id);
                    if (deleteProject && deleteProject.response && deleteProject.response.body) {
                        if (deleteProject.response.body) {
                            console.log("Project has been deleted.")    
                        } else {
                            console.log("Failed when trying delete project")
                        }
                    }   
                }  
            } else {
                console.log(`Project ${projectName} is not found`)
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }
}
