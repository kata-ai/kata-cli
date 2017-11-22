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
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");
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
                let nluDesc = this.helper.loadYaml(`./sandbox/nlu/${sandboxName}.yml`);
                nluDesc.name = name;
                this.helper.dumpYaml("./nlu.yml", nluDesc);
                console.log(`Init NLU ${name}`);
            }
            catch (error) {
                this.helper.wrapError(error);
            }
        });
    }
    push() {
        return __awaiter(this, void 0, void 0, function* () {
            let nluDesc = this.helper.loadYaml("./nlu.yml");
            try {
                const nlu = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameGet, nluDesc.name);
                const entities = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesGet, nluDesc.name);
                if (nlu && nlu.data) {
                    let { lang, visibility } = nluDesc;
                    visibility = visibility || "private";
                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePut, nluDesc.name, { lang, visibility });
                    if (nluDesc.entities && entities.data) {
                        const localDiff = this.helper.difference(nluDesc.entities, entities.data);
                        if (localDiff) {
                            for (const key in localDiff) {
                                if (entities.data[key]) {
                                    // Update remote entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNamePut, nluDesc.name, key, Object.assign({}, nluDesc.entities[key], { name: key }));
                                }
                                else {
                                    // Create new entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                                }
                            }
                        }
                        const remoteDiff = this.helper.difference(entities.data, nluDesc.entities);
                        if (remoteDiff) {
                            for (const key in remoteDiff) {
                                if (!nluDesc.entities[key]) {
                                    // delete remote entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                                }
                            }
                        }
                    }
                    if (!nluDesc.entities && entities.data) {
                        for (const key in entities.data) {
                            // delete remote entity
                            yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                        }
                    }
                    if (nluDesc.entities && !entities.data) {
                        for (const key in nluDesc.entities) {
                            // create new entity
                            yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                        }
                    }
                }
                console.log(`NLU ${nluDesc.name} Updated !`);
            }
            catch (error) {
                let errorMessage;
                if (error.response && error.response.body && error.response.body.message) {
                    errorMessage = error.response.body.message;
                }
                else {
                    errorMessage = error.message;
                }
                if (errorMessage === "You're not authorized to manage this Nlu.") {
                    try {
                        yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusPost, nluDesc);
                        console.log(`NLU ${nluDesc.name} Created !`);
                    }
                    catch (error) {
                        this.helper.wrapError(error);
                    }
                }
                else {
                    this.helper.wrapError(error);
                }
            }
        });
    }
    listNlus(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                page = page || 1;
                limit = limit || 10;
                const nlus = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusGet, { page, limit });
                if (nlus && nlus.data) {
                    let table = new Table({
                        head: ['Name', 'Languange', 'Visibility'],
                        colWidths: [20, 20, 20]
                    });
                    nlus.data.items.forEach((nlus) => {
                        table.push([nlus.name, nlus.lang, nlus.visibility]);
                    });
                    console.log(table.toString());
                }
            }
            catch (error) {
                this.helper.wrapError(error);
            }
        });
    }
}
exports.default = Nlu;
//# sourceMappingURL=nlu.js.map