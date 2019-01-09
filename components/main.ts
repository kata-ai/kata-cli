import { Command, CommandDescriptor, CommandList, IHelper } from "interfaces/main";
import { Component, IConfigReader, IInjector, Json, JsonObject } from "merapi";

const commander = require("commander");
const analytics = require('universal-analytics');

export default class Main extends Component {

    private google:any;

    constructor(
        private config : IConfigReader,
        private injector : IInjector,
        private helper : IHelper
        ) {
        super();

        this.google = analytics(this.config.default('config.trackingId', 'UA-131926842-1'));
    }

    async start(argv:string[]) {
        let commands = this.config.get<CommandList>("commands");
        commander.version(`Kata CLI version ${this.config.default("version", "1.0.0")}`);
        await this.compile(commands, commander);
        commander.parse(argv);
        const validCommands = commander.commands.map((x:any) => x.name());
        if (argv.length === 2 || validCommands.indexOf(argv[2]) === -1) {
            commander.parse([argv[0], argv[1], '-h']);
        }

        this.sendNotificationTracking()
        this.sendDataAnalytics(argv)
    }

    async compile(commands: CommandList, program: Command, currKey : string = "") {
        for (let key in commands) {
            let command = commands[key];

            if (command.type === "group") {
                await this.compileGroup(`${currKey}${key}`, command, program);
            }
            else if (command.type === "alias") {
                this.compileAlias(key, command, program);
            }
            else {
                await this.compileCommand(`${currKey}${key}`, command, program);
            }
        }
    }

    async compileGroup(key: string, command: CommandDescriptor, program: Command) {
        await this.compile(command.subcommands, program, `${key}-`);
    }

    compileAlias(key: string, command: CommandDescriptor, program: Command) {
        program.command(key).action((self) => {
            let args = self._args;
            commander.parse(command.alias.split(/\s+/).concat(args));
        });
    }

    async compileCommand(key: string, command: CommandDescriptor, program: Command) {
        let subcommand;
        let commandKey = command.alias ? command.alias : key;

        if (command.args) {
            subcommand = program.command(`${commandKey} ${command.args}`)
        }
        else {
            subcommand = program.command(commandKey);
        }
        
        if (command.params) {
            for (let i in command.params) {
                let param = command.params[i];
                let flag = param.short ? `-${param.short}, --${i}` : `--${i}`;
                if (param.value !== undefined)
                    subcommand.option(`${flag} <value>`, param.desc || "", param.value);
                else if(param.bool)
                    subcommand.option(flag, param.desc || "");
                else
                    subcommand.option(`${flag} [value]`, param.desc || "");
            }
        }

        subcommand.action(await this.createAction(command.handler, command.middleware));
    }

    async createAction(handler:string, middleware : string[] = []) : Promise<(...args:any[]) => void> {
        let methods : any[] = [];
        for (let i=0; i<middleware.length; i++) {
            methods.push(await this.injector.resolveMethod(middleware[i]));
        }
        let handlerMethod = await this.injector.resolveMethod(handler);

        return (...args:any[]) => {
            for (let i=0; i<methods.length; i++)
                args = methods[i](...args);

            handlerMethod(...args);
        }
    }

    private sendDataAnalytics(command:string[]) {
        let firstLogin = this.helper.getProp("first_login") as JsonObject;
        let projectId = this.helper.getProp("projectId") as string;
        let projectName = this.helper.getProp("projectName") as string;
        const version = this.config.default("version", "1.0.0")

        if (!firstLogin) firstLogin = { id: null, username: null, type: null }
        if (!projectId) projectId = null
        if (!projectName) projectName = null

        const data = {
            userId: firstLogin.id,
            username: firstLogin.username,
            currentUserType: firstLogin.type,
            activeProjectId: projectId,
            activeProjectName: projectName,
            command: command.splice(2).join(' '),
            versionCLI: version,
            timestamp: new Date().getTime()
        }

        this.google.event('commands', 'track', JSON.stringify(data), (err:any) => {
            if (err) console.log(this.helper.wrapError(err));
        })
    }

    private sendNotificationTracking() {
        const status:Boolean = this.helper.checkNotificationStatus();
        if (!status) console.log(`\nStarting from Kata CLI v${this.config.default("version", "1.0.0")}, we added analytics to Kata CLI that will collect usage data every time you typed a command. To learn about what we collect and how we use it, visit https://privacy.kata.ai/kata-cli-analytics\n`)
    }
}
