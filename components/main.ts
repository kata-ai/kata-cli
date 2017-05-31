import { Component, ILogger, IConfigReader, Json, IInjector } from "merapi";
import { Command, CommandList, CommandDescriptor } from "interfaces/main";

const commander = require("commander");

export default class Main extends Component {

    constructor(
        private config : IConfigReader,
        private injector : IInjector
        ) {
        super();
    }

    async start(argv:string[]) {
        let commands = this.config.get<CommandList>("commands");
        this.compile(commands, commander);
        commander.parse(argv);
    }

    compile(commands: CommandList, program: Command) {
        // console.log(commands);
        Object.keys(commands).forEach((key) => {
            let command = commands[key];

            switch (command.type) {
                case "group":
                    this.compileGroup(key, command, program);
                    break;
                case "alias":
                    this.compileAlias(key, command, program);
                    break;
                default:
                    this.compileCommand(key, command, program);
                    break;
            }
        });
    }

    compileGroup(key: string, command: CommandDescriptor, program: Command) {
        let subcommand = program.command(key);
        subcommand.description(command.desc);
        this.compile(command.subcommands, subcommand);

        subcommand.action((...args : any[]) => {
            if (args.length == 1) {
                let [self] = args;
                subcommand.parse(self._args);
            } else {
                console.log(args);
                args.pop();
                let cmd = args.shift();
                subcommand.emit(cmd, args);
            }
        })
    }

    compileAlias(key: string, command: CommandDescriptor, program: Command) {
        program.command(key).action((self) => {
            let args = self._args;
            commander.parse(command.alias.split(/\s+/).concat(args));
        });
    }

    compileCommand(key: string, command: CommandDescriptor, program: Command) {
        let subcommand;

        if (command.args)
            subcommand = program.command(`${key} ${command.args}`)
        else
            subcommand = program.command(key);
        
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

        subcommand.action(this.createAction(command.handler, command.middleware));
    }

    createAction(handler:string, middleware : string[] = []) : (...args:any[]) => void {
        let methods : any[] = [];
        for (let i=0; i<middleware.length; i++) {
            methods.push(this.injector.resolveMethod(middleware[i]));
        }
        let handlerMethod = this.injector.resolveMethod(handler);
        return (...args:any[]) => {
            for (let i=0; i<methods.length; i++)
                args = methods[i](...args);
            handlerMethod(...args);
        }
    }
}
