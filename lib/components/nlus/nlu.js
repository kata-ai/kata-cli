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
const merapi_1 = require("merapi");
const Table = require("cli-table");
const fs = require("fs");
const template = {
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
class Nlu extends merapi_1.Component {
    constructor(helper, api) {
        super();
        this.helper = helper;
        this.api = api;
    }
    init(name, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sandboxName = sandbox || "default";
                const nluDesc = template[sandboxName];
                nluDesc.name = name;
                this.helper.dumpYaml("./nlu.yml", nluDesc);
                console.log(`Init NLU ${name}`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    push() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = this.helper.getProp("projectId");
            const nluDesc = this.helper.loadYaml("./nlu.yml");
            let nlu;
            let entities;
            try {
                nlu = yield this.helper.toPromise(this.api.projectApi, this.api.projectApi.projectsProjectIdNluGet, nluDesc.name);
                entities = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesGet, nluDesc.name);
            }
            catch (error) {
                if (error.status === 400) {
                    console.log(`No NLU under project ${projectId} found`);
                    return;
                }
                else {
                    console.log(this.helper.wrapError(error));
                }
                return;
            }
            try {
                if (nlu && nlu.data) {
                    let { lang, visibility } = nluDesc;
                    visibility = visibility || "private";
                    // await this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePut,
                    //     nluDesc.name, { lang, visibility });
                    if (nluDesc.entities && entities.data) {
                        const localDiff = this.helper.difference(nluDesc.entities, entities.data);
                        if (localDiff) {
                            for (const key in localDiff) {
                                if (entities.data[key]) {
                                    // Update remote entity
                                    if (!nluDesc.entities[key].inherit) {
                                        yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNamePut, nluDesc.name, key, Object.assign({}, nluDesc.entities[key], { name: key }));
                                    }
                                }
                                else {
                                    // Create new entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                                }
                            }
                        }
                        const remoteDiff = this.helper.difference(entities.data, nluDesc.entities);
                        if (remoteDiff) {
                            for (const key in remoteDiff) {
                                if (!nluDesc.entities[key]) {
                                    // delete remote entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                                }
                            }
                        }
                    }
                    if (!nluDesc.entities && entities.data) {
                        for (const key in entities.data) {
                            if (entities.data[key]) {
                                // delete remote entity
                                yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                            }
                        }
                    }
                    if (nluDesc.entities && !entities.data) {
                        for (const key in nluDesc.entities) {
                            if (entities.data[key]) {
                                // create new entity
                                yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                            }
                        }
                    }
                }
                console.log(`NLU ${nluDesc.name} Updated !`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    train(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nluDesc = this.helper.loadYaml("./nlu.yml");
                let opts = {};
                if (options.file) {
                    console.log(`Training.. (input file: ${options.file})`);
                    opts = {
                        file: fs.createReadStream(options.file)
                    };
                }
                else if (options.sentence) {
                    console.log(`Training.. (input: ${options.sentence})`);
                    opts = {
                        sentence: options.sentence
                    };
                }
                const trainResult = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameTrainPost, nluDesc.name, opts);
                console.log(`Success: ${trainResult.data.count} data trained !`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    predict(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nluDesc = !options.nlu ? this.helper.loadYaml("./nlu.yml") : { name: "" };
                let nluName = nluDesc.name;
                let opts = {};
                if (options.file) {
                    console.log(`Predict.. (input file: ${options.file})`);
                    opts = {
                        file: fs.createReadStream(options.file)
                    };
                    nluName = options.nlu || nluName;
                }
                else if (options.sentence) {
                    console.log(`Predict.. (input: ${options.sentence})`);
                    opts = {
                        sentence: options.sentence
                    };
                    nluName = options.nlu || nluName;
                }
                else {
                    throw new Error("Please input sentence or file to predict");
                }
                const predicResult = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePredictPost, nluName, opts);
                console.log(`Success, result : `);
                let i = 0;
                predicResult.response.body.result.forEach((x) => {
                    console.log(`${++i}. Input: ${x.input}`);
                    console.log(`   Result: ${JSON.stringify(x.output)}`);
                });
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    listProfiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profiles = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusProfilesGet);
                if (profiles && profiles.data) {
                    const table = new Table({
                        head: ["Type", "Name", "Desc"],
                        colWidths: [10, 10, 40]
                    });
                    profiles.data.forEach((profile) => {
                        table.push([profile.type, profile.name, profile.desc]);
                    });
                    console.log(table.toString());
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    listNlus(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                page = page || 1;
                limit = limit || 10;
                const projectId = this.helper.getProp("projectId");
                const nlus = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusGet, projectId, { page, limit });
                if (nlus && nlus.data) {
                    const table = new Table({
                        head: ["Name", "Language", "Visibility"],
                        colWidths: [20, 20, 20]
                    });
                    nlus.data.items.forEach((nlus) => {
                        table.push([nlus.name, nlus.lang, nlus.visibility]);
                    });
                    console.log(table.toString());
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    snapshot() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectId = this.helper.getProp("projectId");
                const nluDesc = this.helper.loadYaml("./nlu.yml");
                const result = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.projectsProjectIdNluSnapshotGet, projectId, nluDesc.name);
                console.log(`Snapshot captured!`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
}
exports.default = Nlu;
//# sourceMappingURL=nlu.js.map