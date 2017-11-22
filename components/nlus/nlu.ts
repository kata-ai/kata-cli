import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");

export default class Nlu extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    async init(name: string, sandbox?: string) {
        try {
            const sandboxName = sandbox || "default";
            let nluDesc = this.helper.loadYaml(`./sandbox/nlu/${sandboxName}.yml`);
            
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