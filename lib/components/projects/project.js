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
const colors = require("colors/safe");
class Project {
    constructor(api, helper) {
        this.api = api;
        this.helper = helper;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            let projectData = { name: "" };
            while (true) {
                projectData = yield this.helper.inquirerPrompt([
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
                    console.error("error: Project name must start with alphabet characters and contains only aplhanumeric character or underscore");
                }
                else {
                    break;
                }
            }
            const inquiredOptions = yield this.helper.inquirerPrompt([
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
            const options = Object.assign({ bot: true, cms: true, nlu: true }, inquiredOptions);
            let nluOptions = {};
            if (options.nlu) {
                nluOptions = yield this.helper.inquirerPrompt([
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
            const requestBody = Object.assign({}, projectData, { options: Object.assign({}, options, nluOptions) });
            try {
                const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsPost, requestBody);
                if (response && response.body && response.body.id) {
                    const project = response.body;
                    const projectId = project.id;
                    this.helper.setProp("projectId", projectId);
                    console.log(colors.green(`Project "${project.name}" (${projectId}) is successfully created`));
                    return;
                }
            }
            catch (e) {
                console.error(this.helper.wrapError(e));
            }
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, {});
                if (response && response.body && response.body.data) {
                    const table = new Table({
                        head: ["Project ID", "Project Name"],
                        colWidths: [38, 32]
                    });
                    response.body.data.forEach((project) => {
                        table.push([project.id, project.name]);
                    });
                    console.log(table.toString());
                }
            }
            catch (e) {
                console.error(this.helper.wrapError(e));
            }
        });
    }
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, { limit: 50 });
                if (response && response.body && response.body.data) {
                    const projectList = response.body.data;
                    const choices = projectList.map((projectRow) => ({ name: projectRow.name, value: projectRow }));
                    const { project } = yield inquirer.prompt([
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
            }
            catch (e) {
                console.error(this.helper.wrapError(e));
            }
        });
    }
}
exports.default = Project;
//# sourceMappingURL=project.js.map