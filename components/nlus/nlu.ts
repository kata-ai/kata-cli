import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";

const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");
const fs = require("fs");
const template: any = {
    default: {
        name: "kata",
        lang: "id",
        entities: {
           LOCATION: {
              type: "phrase",
              profile: "location"
           },
           PERSON: {
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
     locationlabel:{
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
           LOCATION: {
              type: "phrase",
              profile: "location"
           }
        }
     },
     name: {
        name: "person",
        lang: "id",
        entities: {
           PERSON: {
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
}

export default class Nlu extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    async init(name: string, sandbox?: string) {
        try {
            const sandboxName: any = sandbox || "default";
            let nluDesc: any = template[sandboxName];
            
            nluDesc.name = name;
            this.helper.dumpYaml("./nlu.yml", nluDesc);
            console.log(`Init NLU ${name}`);
        } catch (error) {
            this.helper.wrapError(error);
        }
    }

    async push() {
        let nluDesc: any = this.helper.loadYaml("./nlu.yml");

        try {
            const nlu = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameGet, nluDesc.name);
            const entities = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesGet, nluDesc.name);

            if (nlu && nlu.data) {
                let { lang, visibility } = nluDesc;
                visibility = visibility || "private";
                await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePut, nluDesc.name, { lang, visibility });

                if (nluDesc.entities && entities.data) {
                    const localDiff = this.helper.difference(nluDesc.entities, entities.data);
                    if (localDiff) {
                        for (const key in localDiff) {
                            if (entities.data[key]) {
                                // Update remote entity
                                await this.helper.toPromise(this.api.nluApi,
                                    this.api.nluApi.nlusNluNameEntitiesEntityNamePut,
                                    nluDesc.name, key, { ...nluDesc.entities[key], name: key });
                            } else {
                                // Create new entity
                                await this.helper.toPromise(this.api.nluApi,
                                    this.api.nluApi.nlusNluNameEntitiesPost,
                                    nluDesc.name, { ...nluDesc.entities[key], name: key });
                            }
                        }
                    }
    
                    const remoteDiff = this.helper.difference(entities.data, nluDesc.entities);
                    if (remoteDiff) {
                        for (const key in remoteDiff) {
                            if (!nluDesc.entities[key]) {
                                // delete remote entity
                                await this.helper.toPromise(this.api.nluApi,
                                    this.api.nluApi.nlusNluNameEntitiesEntityNameDelete,
                                    nluDesc.name, key);
                            }
                        }
                    }
                }

                if (!nluDesc.entities && entities.data) {
                    for (const key in entities.data) {
                        // delete remote entity
                        await this.helper.toPromise(this.api.nluApi,
                            this.api.nluApi.nlusNluNameEntitiesEntityNameDelete,
                            nluDesc.name, key);
                    }
                }

                if (nluDesc.entities && !entities.data) {
                    for (const key in nluDesc.entities) {
                        // create new entity
                        await this.helper.toPromise(this.api.nluApi,
                            this.api.nluApi.nlusNluNameEntitiesPost,
                            nluDesc.name, { ...nluDesc.entities[key], name: key });
                    }
                }
            }

            console.log(`NLU ${nluDesc.name} Updated !`);
        } catch (error) {
            let errorMessage;
            
            if (error.response && error.response.body && error.response.body.message) {
                errorMessage = error.response.body.message;
            }
            else {
                errorMessage = error.message;
            }

            if (errorMessage === "You're not authorized to manage this Nlu.") {
                try {
                    await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusPost, nluDesc);
                    console.log(`NLU ${nluDesc.name} Created !`);
                } catch (error) {
                    this.helper.wrapError(error);
                }
            } else {
                this.helper.wrapError(error);
            }
        }
    }

    async train(options: JsonObject) {
        try {
            let nluDesc: any = this.helper.loadYaml("./nlu.yml");
            let opts = {};
            if (options.file) {
                console.log(`Training.. (input file: ${options.file})`);
                opts = {
                    file: fs.createReadStream(options.file)
                }
            } else if (options.sentence) {
                console.log(`Training.. (input: ${options.sentence})`);
                opts = {
                    sentence: options.sentence
                }
            }

            const trainResult = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameTrainPost, nluDesc.name, opts);
            console.log(`Success: ${trainResult.data.count} data trained !`);
        } catch (error) {
            this.helper.wrapError(error);
        }
    }

    async predict(options: JsonObject) {
        try {
            let nluDesc: any = this.helper.loadYaml("./nlu.yml");
            let opts = {};
            if (options.file) {
                console.log(`Predict.. (input file: ${options.file})`);
                opts = {
                    file: fs.createReadStream(options.file)
                }
            } else if (options.sentence) {
                console.log(`Predict.. (input: ${options.sentence})`);
                opts = {
                    sentence: options.sentence
                }
            }

            const predicResult = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePredictPost, nluDesc.name, opts);
            console.log(`Success, result : `);
            console.dir(predicResult.response.body.result, {depth:null});
        } catch (error) {
            this.helper.wrapError(error);
        }
    }

    async listProfiles() {
        try {
            const profiles = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusProfilesGet);
            if (profiles && profiles.data) {
                let table = new Table({
                    head: ['Type', 'Name', 'Desc']
                    , colWidths: [20, 20, 20]
                });
                profiles.data.forEach((profile: { type: string, name: string, desc: string }) => {
                    table.push([profile.type, profile.name, profile.type]);
                });
                console.log(table.toString());
            }
        } catch (error) {
            this.helper.wrapError(error);
        }
    }

    async listNlus(page?: number, limit?: number) {
        try {
            page = page || 1;
            limit = limit || 10;
            const nlus = await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusGet, { page , limit });
            if (nlus && nlus.data) {
                let table = new Table({
                    head: ['Name', 'Languange', 'Visibility']
                    , colWidths: [20, 20, 20]
                });
                nlus.data.items.forEach((nlus: { name: string, lang: string, visibility: string }) => {
                    table.push([nlus.name, nlus.lang, nlus.visibility]);
                });
                console.log(table.toString());
            }
        } catch (error) {
            this.helper.wrapError(error);
        }
    }
    
}