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
let colors = require("colors/safe");
class Tester extends merapi_1.Component {
    constructor(config, helper) {
        super();
        this.config = config;
        this.helper = helper;
    }
    execIntentTest(yaml, botApi, botId, print = function (text) { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let flow = yaml.flow;
            let context = yaml.context || {};
            let data = yaml.data || {};
            let result = {};
            print(yaml.desc);
            let tab = "    ";
            for (let name in yaml.test) {
                let test = yaml.test[name];
                let testIntent = test.intent || null;
                let testContext = Object.assign({}, context, test.context || {});
                let testData = Object.assign({}, data, test.data || {});
                let testMessage = Object.assign({ type: "text", content: "", payload: {} }, test.message || {});
                let body = {
                    flow,
                    "intent": testIntent,
                    "message": testMessage,
                    "context": testContext,
                    "data": testData
                };
                let execResult = yield this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "intent", body);
                result[name] = this.helper.compareTestResult(execResult.data, test.expect);
                print(tab + name + ": " + (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
            }
            return result;
        });
    }
    execStateTest(yaml, botApi, botId, print = function (text) { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let flow = yaml.flow;
            let context = yaml.context || {};
            let data = yaml.data || {};
            let result = {};
            print(yaml.desc);
            let tab = "    ";
            for (let name in yaml.test) {
                let test = yaml.test[name];
                let testState = test.state;
                let testContext = Object.assign({}, context, test.context || {});
                let testData = Object.assign({}, data, test.data || {});
                let testMessage = Object.assign({ type: "text", content: "", payload: {} }, test.message || {}, { intent: test.intent, attributes: test.attributes });
                let body = {
                    flow,
                    state: testState,
                    message: testMessage,
                    context: testContext,
                    data: testData
                };
                let execResult = yield this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "state-mapper", body);
                result[name] = this.helper.compareTestResult(execResult.data, test.expect);
                print(tab + name + ": " + (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
            }
            return result;
        });
    }
    execActionsTest(yaml, botApi, botId, print = function (text) { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let flow = yaml.flow;
            let context = yaml.context || {};
            let data = yaml.data || {};
            let result = {};
            print(yaml.desc);
            let tab = "    ";
            for (let name in yaml.test) {
                let test = yaml.test[name];
                let testState = test.state;
                let testContext = Object.assign({}, context, test.context || {});
                let testData = Object.assign({}, data, test.data || {});
                let testMessage = Object.assign({ type: "text", content: "", payload: {} }, test.message || {}, { intent: test.intent, attributes: test.attributes });
                let body = {
                    flow,
                    state: testState,
                    message: testMessage,
                    context: testContext,
                    data: testData
                };
                let execResult = yield this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "action", body);
                result[name] = this.helper.compareTestResult(execResult.data, test.expect);
                print(tab + name + ": " + (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
            }
            return result;
        });
    }
    execFlowTest(yaml, botApi, botId, print = function (text) { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let flow = yaml.flow;
            let state = yaml.state || null;
            let context = yaml.context || {};
            let data = yaml.data || {};
            let result = {};
            print(yaml.desc);
            let tab = "    ";
            for (let name in yaml.test) {
                let test = yaml.test[name];
                let message = Object.assign({ type: "text", content: "", payload: {} }, test.message || {}, { intent: test.intent, attributes: test.attributes });
                let body = { flow, state, message, context, data };
                let execResult = yield this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "flow", body);
                result[name] = this.helper.compareTestResult(execResult.data, test.expect);
                print(tab + name + ": " + (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
                if (!execResult)
                    break;
                state = execResult.data.state;
                context = execResult.data.context;
                data = execResult.data;
            }
            return result;
        });
    }
}
exports.default = Tester;
//# sourceMappingURL=tester.js.map