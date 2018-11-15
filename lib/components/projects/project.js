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
const colors = require('colors/safe');
class Project {
    constructor(api, helper) {
        this.api = api;
        this.helper = helper;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectData = yield this.helper.inquirerPrompt([
                {
                    type: "text",
                    name: "name",
                    message: "Project name:",
                },
            ]);
            const options = yield this.helper.inquirerPrompt([
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
                {
                    type: "confirm",
                    name: "bot",
                    message: "Use bot?",
                    default: true,
                },
                {
                    type: "confirm",
                    name: "cms",
                    message: "Use cms?",
                    default: true,
                },
                {
                    type: "confirm",
                    name: "nlu",
                    message: "Use nlu?",
                    default: true,
                },
            ]);
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
            const requestBody = Object.assign({}, projectData, { options: Object.assign({}, options, { nluOptions }) });
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
                const { response } = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsGet, {});
                if (response && response.body && response.body.data) {
                    const projectList = response.body.data;
                    const choices = projectList.map((project) => ({ name: project.name, value: project }));
                    const { project } = yield inquirer.prompt([
                        {
                            type: 'list',
                            name: 'project',
                            message: "Select project:",
                            paginated: true,
                            choices
                        },
                    ]);
                    this.helper.setProp("projectId", project.id);
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