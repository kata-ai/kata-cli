import { Component, IConfig, JsonObject, IHash } from "merapi";
import { IHelper } from "interfaces/main";

let colors = require("colors/safe");

export default class Tester extends Component {
    constructor(private config: IConfig, private helper: IHelper) {
        super();
    }

    async execIntentTest(yaml: any, botApi: any, botId: string, print = function(text: string){}) : Promise<IHash<{field: string, expect: any, result: any}[]>> {
        let flow = yaml.flow;
        let context = yaml.context || {};
        let data = yaml.data || {};
        let result : IHash<{field: string, expect: any, result: any}[]> = {};
        print(yaml.desc);
        let tab = "    ";

        for (let name in yaml.test) {
            let test = yaml.test[name];
            let testIntent = test.intent || null;
            let testContext = Object.assign({}, context, test.context || {});
            let testData = Object.assign({}, data, test.data || {});
            let testMessage = Object.assign({type:"text", content:"", payload:{}}, test.message || {});

            let body = {
                flow,
                "intent": testIntent,
                "message": testMessage,
                "context": testContext,
                "data": testData
            };

            let execResult = await this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "intent", body);
            result[name] = this.helper.compareTestResult(execResult.data, test.expect);
            print(tab+name+": "+ (result[name] && !result[name].length  ? colors.green("passed") : colors.red("not passing")));
        }

        return result;
    }
    
    async execStateTest(yaml: any, botApi: any, botId: string, print = function(text: string){}) : Promise<IHash<{field: string, expect: any, result: any}[]>> {
        let flow = yaml.flow;
        let context = yaml.context || {};
        let data = yaml.data || {};
        let result : IHash<{field: string, expect: any, result: any}[]> = {};
        print(yaml.desc);
        let tab = "    ";

        for (let name in yaml.test) {
            let test = yaml.test[name];
            let testState = test.state;
            let testContext = Object.assign({}, context, test.context || {});
            let testData = Object.assign({}, data, test.data || {});
            let testMessage = Object.assign({type:"text", content:"", payload:{}}, test.message || {}
                , {intent:test.intent, attributes:test.attributes});
            
            let body = {
                flow,
                state: testState,
                message: testMessage,
                context: testContext,
                data: testData
            };

            let execResult = await this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "state-mapper", body);
            result[name] = this.helper.compareTestResult(execResult.data, test.expect);
            print(tab+name+": "+ (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
        }

        return result;
    }

    async execActionsTest(yaml: any, botApi: any, botId: string, print = function(text: string){}) : Promise<IHash<{field: string, expect: any, result: any}[]>> {
        let flow = yaml.flow;
        let context = yaml.context || {};
        let data = yaml.data || {};
        let result : IHash<{field: string, expect: any, result: any}[]> = {};
        print(yaml.desc);
        let tab = "    ";

        for (let name in yaml.test) {
            let test = yaml.test[name];
            let testState = test.state;
            let testContext = Object.assign({}, context, test.context || {});
            let testData = Object.assign({}, data, test.data || {});
            let testMessage = Object.assign({type:"text", content:"", payload:{}}, test.message || {}
                , {intent:test.intent, attributes:test.attributes});
            
            let body = {
                flow,
                state: testState,
                message: testMessage,
                context: testContext,
                data: testData
            };

            let execResult = await this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "action", body);
            result[name] = this.helper.compareTestResult(execResult.data, test.expect);
            print(tab+name+": "+ (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
        }

        return result;
    }

    async execFlowTest(yaml: any, botApi: any, botId: string, print = function(text: string){}) : Promise<IHash<{field: string, expect: any, result: any}[]>> {
        let flow = yaml.flow;
        let state = yaml.state || null;
        let context = yaml.context || {};
        let data = yaml.data || {};
        let result : IHash<{field: string, expect: any, result: any}[]> = {};
        print(yaml.desc);
        let tab = "    ";

        for (let name in yaml.test) {
            let test = yaml.test[name];
            let message = Object.assign({type:"text", content:"", payload:{}}, test.message || {}
                , {intent:test.intent, attributes:test.attributes});

            let body = { flow, state, message, context, data };

            let execResult = await this.helper.toPromise(botApi, botApi.botsBotIdExecObjectPost, botId, "flow", body);
            result[name] = this.helper.compareTestResult(execResult.data, test.expect);
            print(tab+name+": "+ (result[name] && !result[name].length ? colors.green("passed") : colors.red("not passing")));
            if (!execResult) break;
            state = execResult.data.state;
            context = execResult.data.context;
            data = execResult.data;
        }

        return result;
    }
}
