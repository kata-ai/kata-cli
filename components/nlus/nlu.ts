import { IHelper } from "interfaces/main";
import { Component, JsonObject, JsonArray } from "merapi";
const Table = require("cli-table");
const fs = require("fs");
const yaml = require("js-yaml");

const template: any = {
    default: {
        name: "kata",
        lang: "id",
        entities: {
            location: {
                type: "phrase",
                profile: "location"
            },
            person: {
                type: "phrase",
                profile: "name"
            }
        }
    },
    email: {
        name: "email",
        lang: "id",
        entities: {
            email: {
                type: "phrase",
                profile: "email"
            }
        }
    },
    locationlabel: {
        name: "location_kata",
        lang: "id",
        entities: {
            location: {
                type: "phrase",
                profile: "location",
                labels: [
                    "common",
                    "places",
                    "city",
                    "street",
                    "country",
                    "airport"
                ],
                resolver: "location"
            }
        }
    },
    location: {
        name: "location",
        lang: "id",
        entities: {
            location: {
                type: "phrase",
                profile: "location"
            }
        }
    },
    name: {
        name: "person",
        lang: "id",
        entities: {
            person: {
                type: "phrase",
                profile: "name"
            }
        }
    },
    sentiment: {
        name: "sentiment",
        lang: "id",
        entities: {
            sentiment: {
                type: "trait",
                profile: "sentiment",
                labels: [
                    "positive",
                    "negative",
                    "neutral"
                ]
            }
        }
    }
};

const errorFileLog = "training.error.log";

export default class Nlu extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    public async init(name: string, sandbox?: string) {
        try {
            const sandboxName: any = sandbox || "default";
            const nluDesc: any = template[sandboxName];

            nluDesc.name = name;
            this.helper.dumpYaml("./nlu.yml", nluDesc);
            console.log(`Init NLU ${name}`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async pull() {

        const projectId = this.helper.getProp("projectId");
        let nluDesc;

        try {
            const { response: { body } } = await this.helper.toPromise(this.api.projectApi,
                this.api.projectApi.projectsProjectIdNluGet, projectId);
            const {name, lang, visibility, entities} = body;
            nluDesc = {name, lang, visibility, entities};
        } catch (error) {
            console.log("Error: ", this.helper.wrapError(error));
            return;
        }
        for (const entity in nluDesc.entities) {
            if (nluDesc.entities[entity] && nluDesc.entities[entity].type === "dict") {
                // get dictionary
                try {
                    const { response: { body } } = await this.helper.toPromise(this.api.nluApi,
                        this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNameGet,
                        projectId, nluDesc.name, entity);
                    if (body.dictionary) {
                        nluDesc.entities[entity].dictionary = body.dictionary;
                    }
                } catch (error) {
                    console.log("Error: ", this.helper.wrapError(error));
                    return;
                }
            }
        }

        const nluYml = yaml.dump(nluDesc);
        console.log("Writing to nlu.yml...");
        fs.writeFileSync("nlu.yml", nluYml);
    }

    public async push() {

        const projectId = this.helper.getProp("projectId");
        let nluDesc: any = null;
        try {
          nluDesc = this.helper.loadYaml("./nlu.yml");
        } catch (error) {
            if (error.code === "ENOENT") {
                console.log(
                    "error: NLU file 'nlu.yml' does not exist, try calling 'kata nl-pull' to fetch 'nlu.yml' from the server"
                );
            }
            return;
        }

        let nlu;
        let entities;

        try {
            const { response: { body } } = await this.helper.toPromise(this.api.projectApi,
                this.api.projectApi.projectsProjectIdNluGet, projectId);
            nlu = body;
        } catch (error) {
            console.log(this.helper.wrapError(error));
            return;
        }
        try {
            const { response: { body } } = await this.helper.toPromise(this.api.nluApi,
                this.api.nluApi.projectsProjectIdNlusNluNameEntitiesGet, projectId, nluDesc.name);
            entities = body;
        } catch (error) {
            console.log(this.helper.wrapError(error));
            return;
        }


        try {
            if (nlu) {
                let { lang, visibility } = nluDesc;
                visibility = visibility || "private";
                // await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePut,
                //     nluDesc.name, { lang, visibility });

                if (nluDesc.entities && entities) {
                    const localDiff = this.helper.difference(nluDesc.entities, entities);

                    if (localDiff) {
                        for (const key in localDiff) {
                            if (entities[key]) {
                                // Update remote entity
                                if (!nluDesc.entities[key].inherit) {
                                    await this.helper.toPromise(this.api.nluApi,
                                        this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNamePut,
                                        projectId, nluDesc.name, key, { ...nluDesc.entities[key], name: key });
                                }
                            } else {
                                // Create new entity
                                if ((key as string).length > 20) {
                                    console.log(`Failed to create ${key}. Entity name must not be longer than 20 characters.`);
                                    continue;
                                }
                                await this.helper.toPromise(this.api.nluApi,
                                    this.api.nluApi.projectsProjectIdNlusNluNameEntitiesPost,
                                    projectId, nluDesc.name, { ...nluDesc.entities[key], name: key });
                            }
                        }
                    }

                    const remoteDiff = this.helper.difference(entities, nluDesc.entities);
                    if (remoteDiff) {
                        for (const key in remoteDiff) {
                            if (!nluDesc.entities[key]) {
                                // delete remote entity
                                await this.helper.toPromise(this.api.nluApi,
                                    this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNameDelete,
                                    projectId, nluDesc.name, key);
                            }
                        }
                    }
                }

                if (!nluDesc.entities && entities) {
                    for (const key in entities) {
                        if (entities[key]) {
                            // delete remote entity
                            await this.helper.toPromise(this.api.nluApi,
                                this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNameDelete,
                                projectId, nluDesc.name, key);
                        }
                    }
                }

                if (nluDesc.entities && !entities) {
                    for (const key in nluDesc.entities) {
                        if (nluDesc.entities[key]) {
                            // create new entity
                            if ((key as string).length > 20) {
                                console.log(`Failed to create ${key}. Entity name must not be longer than 20 characters.`);
                                continue;
                            }
                            await this.helper.toPromise(this.api.nluApi,
                                this.api.nluApi.projectsProjectIdNlusNluNameEntitiesPost,
                                projectId, nluDesc.name, { ...nluDesc.entities[key], name: key });
                        }
                    }
                }
            }

            console.log(`NLU ${nluDesc.name} Updated !`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async train(options: JsonObject) {
        const projectId = this.helper.getProp("projectId");
        let nluDesc;
        try {
            nluDesc = this.helper.loadYaml("./nlu.yml");
        } catch (e) {
            console.log("Missing nlu.yml");
            return;
        }
        const nluName = nluDesc.name;
        if (!nluName) {
            console.log("Missing name in nlu.yml");
            return;
        }
        // check training job
        const result = await this.helper.toPromise(this.api.nluApi,
            this.api.nluApi.projectsProjectIdNlusNluNameHasActiveJobGet, projectId, nluName);
        if (result.data) {
            console.log("Sorry, your previous training is still running. " +
                "Give it another try in a few minutes.");
            return;
        }
        try {
            let opts: any = {};
            if (options.file) {
                console.log(`Training.. (input file: ${options.file})`);
                opts = {
                    file: fs.createReadStream(options.file)
                };
            } else if (options.sentence) {
                console.log(`Training.. (input: ${options.sentence})`);
                opts = {
                    sentence: options.sentence
                };
            }

            const { response: { body } } = await this.helper.toPromise(this.api.nluApi,
                this.api.nluApi.projectsProjectIdNlusNluNameTrainPost, projectId, nluName, opts);
            const trainResult = body;

            // Print result
            const count = trainResult.count;
            const successCount = trainResult.rowIds ? trainResult.rowIds.length : 0;
            if (successCount) {
                console.log(`Success: ${successCount} data trained !`);
            }

            // Write error to file
            const errorCount = trainResult.errRows ? trainResult.errRows.length : 0;
            if (errorCount) {
                if (options.file) {
                    const rawData = fs.readFileSync(options.file).toString("utf8");
                    const trainingData = rawData.split("\n");
                    let errData = "";
                    for (const i of trainResult.errRows) {
                        errData += trainingData[i] + "\n";
                    }
                    fs.writeFile(errorFileLog, errData, (err: any) => {
                        if (err) { throw err; }
                        console.log(`Error training ${errorCount} data. See details on ${errorFileLog}`);
                    });
                } else if (options.sentence) {
                    console.log(`Error training data`);
                }
            }

        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async predict(options: JsonObject) {
        const projectId = this.helper.getProp("projectId");
        let nluDesc;
        try {
            nluDesc = this.helper.loadYaml("./nlu.yml");
        } catch (e) {
            console.log("Missing nlu.yml");
            return;
        }
        const nluName = nluDesc.name;
        if (!nluName) {
            console.log("Missing name in nlu.yml");
            return;
        }
        try {
            let opts = {};
            if (options.file) {
                console.log(`Predict.. (input file: ${options.file})`);
                opts = {
                    file: fs.createReadStream(options.file)
                };

            } else if (options.sentence) {
                console.log(`Predict.. (input: ${options.sentence})`);
                opts = {
                    sentence: options.sentence
                };

            } else {
                throw new Error("Please input sentence or file to predict");
            }

            const { response: { body } } = await this.helper.toPromise(
                this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNamePredictPost, projectId, nluName, opts
            );
            console.log(`Success, result : `);
            let i = 0;
            body.result.forEach((x: any) => {
                console.log(`${++i}. Input: ${x.input}`);
                console.log(`   Result: ${JSON.stringify(x.output)}`);

            });
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async listProfiles() {
        try {
            const profiles = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusProfilesGet);
            if (profiles && profiles.data) {
                const table = new Table({
                    head: ["Type", "Name", "Desc"]
                    , colWidths: [10, 10, 40]
                });
                profiles.data.forEach((profile: { type: string, name: string, desc: string }) => {
                    table.push([profile.type, profile.name, profile.desc]);
                });
                console.log(table.toString());
            }
        } catch (error) {
            console.log(error);
        }
    }

    // deprecated soon
    private async listNlus(page?: number, limit?: number) {
        try {
            page = page || 1;
            limit = limit || 10;

            const projectId = this.helper.getProp("projectId");
            const nlus = await this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdNluGet, projectId, { page, limit });
            if (nlus && nlus.data) {
                const table = new Table({
                    head: ["Name", "Language", "Visibility"]
                    , colWidths: [20, 20, 20]
                });
                nlus.data.items.forEach((nlus: { name: string, lang: string, visibility: string }) => {
                    table.push([nlus.name, nlus.lang, nlus.visibility]);
                });
                console.log(table.toString());
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async snapshot() {
        const projectId = this.helper.getProp("projectId");
        try {
            const nluDesc: any = this.helper.loadYaml("./nlu.yml");
            const result = await this.helper.toPromise(this.api.nluApi,
                this.api.nluApi.projectsProjectIdNlusNluNameSnapshotGet, projectId, nluDesc.name);

            console.log(`Snapshot captured!`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async listTraining(params?:any) {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const projectName = this.helper.getProp("projectName");
                const username = this.helper.getProp("current_login");

                const { response } = await this.helper.toPromise(
                    this.api.nluApi,
                    this.api.nluApi.projectsProjectIdNlusNluNameTrainingDataGet,
                    projectId,
                    `${username}:${projectName}`,
                    { page: params.page || 1 }
                );

                if (response && response.body && response.body.data) {
                    const table = new Table({
                        head: ["Train Data", "Entities"],
                        colWidths: [50, 50]
                    });

                    response.body.data.forEach((data: any) => {
                        const entities: JsonArray = data.entities.map((e:any) => {
                            return `(${e.entity}:${e.label}) ${e.value}`
                        })
                        table.push([data.input, entities.join("\n")]);
                    });
                    console.log(table.toString());
                } else {
                    console.log("Failed when trying list train data")
                }
            } else {
                console.log("Please select project first")
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async listPrediction(params?:any) {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const projectName = this.helper.getProp("projectName");
                const username = this.helper.getProp("current_login");

                const { response } = await this.helper.toPromise(
                    this.api.nluApi,
                    this.api.nluApi.projectsProjectIdNlusNluNameLogGet,
                    projectId,
                    `${username}:${projectName}`,
                    { page: params.page || 1, limit: 10 }
                );

                if (response && response.body && response.body.result) {
                    const table = new Table({
                        head: ["Prediction Log", "Entities"]
                    });

                    response.body.result.forEach((data: any) => {
                        const entities: JsonArray = data.corrected.entities.map((e:any) => {
                            return `(${e.entity}:${e.label}) ${e.value}`
                        })
                        
                        table.push([data.corrected.input, entities.join("\n")]);
                    });
                    console.log(table.toString());
                } else {
                    console.log("Failed when trying list prediction log")
                }
            } else {
                console.log("Please select project first")
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async listRevision() {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const { response } = await this.helper.toPromise(
                    this.api.projectApi,
                    this.api.projectApi.projectsProjectIdNluRevisionsGet,
                    projectId
                );
    
                if (response && response.body && response.body.data) {
                    const table = new Table({
                        head: ["Snapshot", "Date"],
                        colWidths: [50, 25]
                    });
    
                    response.body.data.forEach((data: any) => {
                        table.push([data.revision, new Date(data.created_at).toLocaleString()]);
                    });
                    console.log(table.toString());
                } else {
                    console.log("Failed when trying get revision list")
                }
            } else {
                console.log("Please select project first")
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async detail() {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const { response } = await this.helper.toPromise(
                    this.api.nluApi,
                    this.api.nluApi.projectsProjectIdNluGet,
                    projectId
                );
    
                if (response && response.body) {
                    const table = new Table({
                        head: ["NLU Name", "NLU ID", "Language", "Token"]
                    });
    
                    const language = (response.body.lang == "id") ? "Bahasa Indonesia" : "English"
    
                    table.push([response.body.name, response.body.id, language, response.body.token]);
    
                    console.log(table.toString());
                } else {
                    console.log("Failed when trying get NL detail")
                }
            } else {
                console.log("Please select project first")
            }            
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async issueToken() {
        try {
            const projectId = this.helper.getProp("projectId");
            if (projectId) {
                const projectName = this.helper.getProp("projectName");
                const username = this.helper.getProp("current_login");

                const { response } = await this.helper.toPromise(
                    this.api.nluApi,
                    this.api.nluApi.projectsProjectIdNlusNluNameIssueTokenGet,
                    projectId,
                    `${username}:${projectName}`
                );

                if (response && response.body) {
                    console.log(response.body.toString())
                } else {
                    console.log("Failed when trying issue token")
                }
            } else {
                console.log("Please select project first")
            }    
        } catch (error) {
            console.log(this.helper.wrapError(error));   
        }
    }
}
