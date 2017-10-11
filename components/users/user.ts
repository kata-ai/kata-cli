import { Component, JsonObject, IHash, Config, Json } from "merapi";
import {v4 as uuid} from "node-uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const repl = require("repl");
const util = require("util");
const deasync = require("deasync");

export default class User extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    async login(options: JsonObject) {
        try {
            let currToken = this.helper.getCurrentToken()["token"];
            if (options.token) {
                if (!currToken)
                    currToken = <string>options.token;

                this.api.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${currToken}`;
                let result = await this.helper.toPromise(this.api.authApi, this.api.authApi.tokensTokenIdGet, options.token);
                let tokenObj = result.data;

                if (tokenObj.type === "user") {
                    this.setToken({ name: "user", type: tokenObj.type}, <string> options.token);
                }
                else if (tokenObj.type === "team") {
                    result = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, tokenObj.teamId);
                    let team = result.data;

                    this.setToken({ name: team.username, type: tokenObj.type}, <string> options.token);
                }
                else {
                    throw new Error("Invalid token");
                }
            } else {
                let user = <string> (options.user ? options.user : "");
                let pass = <string> (options.password ? options.password : "");

                let answer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "user",
                        message: "username: ",
                        when: function() {
                            return !user;
                        },
                        validate: function (user : string) {
                            if (!user)
                                return "Username cannot be empty";
                            
                            return true;
                        }
                    },
                    {
                        type: "password",
                        name: "password",
                        message: "password: ",
                        mask: "*",
                        when: function() {
                            return !pass;
                        },
                        validate: function (password: string) {
                            if (!password)
                                return "Password cannot be empty";
                            
                            return true;
                        }
                    }
                ]);
                
                user = answer.user || user;
                pass = answer.password || pass;
                
                let result = await this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: user, password: pass });
                let token = result.data.id;

                this.helper.setProp("first_login", { type: "user", username: user });
                this.setToken({ name: user, type: "user"  }, token);

                console.log(`Logged in as ${user}`);
            }
        } catch (e) {
            this.helper.wrapError(e);
        }
    }

    async logout() {
        let answer = await this.helper.inquirerPrompt([
            {
                type: "confirm",
                name: "confirmation",
                message: "Do you want to log out ?",
                default: false
            }
        ]);

        if (!answer.confirmation)
            return;

        try {
            let result = await this.helper.delete();
            if (result) {
                console.log("Logged out");
            } else {
                console.log("Please log in first");
            }

        } catch (e) {
            this.helper.wrapError(e);
        }
    }

    async switch(type: string, name?: string) {
        try {
            let firstLogin = <JsonObject> this.helper.getProp("first_login");
            let currentType = this.helper.getProp("current_user_type");
            
            if (currentType === type)
                throw new Error(`Unable to switch : already on ${type}`)

            if (type === "team") {
                let info = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, firstLogin.username);
                let { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, name);
                let teams = info ? info.data.teams.map((x : any) => x.teamId) : [];

                if (data && teams.indexOf(data.id) > -1) {
                    let result = await this.helper.toPromise(this.api.authApi, this.api.authApi.tokensPost, { type: "team", teamId: data.id });
                    let token = result.data.id;
                    this.setToken({ name: name, type: "team" }, token);
                    console.log(`Switched to team ${name}`);
                } else {
                    console.log("Unable to switch to Team : Invalid team");
                }
            } else {
                this.helper.setProp("current_login", firstLogin.username);
                this.helper.setProp("current_user_type", "user");
                console.log(`Switched to user ${firstLogin.username}`);
            }

        } catch (e) {
            this.helper.wrapError(e);
        }   
    }

    async changePassword() {
        try {
            let passObj = await this.getNewPasswordData();
            if (passObj.newPass !== passObj.rePass)
                throw new Error("Invalid retype password");

                let currentUser = <string> this.helper.getProp("current_login");
                let { data } = await this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: currentUser, password: passObj.oldPass});
                if (data) {
                    let result = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdPut, data.userId, { password: passObj.newPass });
                    console.log("Password changed");
                    } else {
                    console.log("Invalid password");
                }
        } catch (error) {
            this.helper.wrapError(error);
        }
    }


    whoami(options: JsonObject) {
        let currentLogin = <string> this.helper.getProp("current_login");
        let currentType = <string> this.helper.getProp("current_user_type");
        console.log(`Current login: ${currentLogin}, login type: ${currentType}`);
    }
    
    async createTeam(name : string) {
        try {
            let currentLogin = <string> this.helper.getProp("current_login");
            let currentUserType = <string> this.helper.getProp("current_user_type");

            if (currentUserType !== "user")
                throw new Error("Must be on user to do this operation");
            
            let { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsPost, { username: name, password: "", roleId: "teamAdmin" });

            if (response && response.body.id) {
                let { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);
                let result = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, response.body.id, data.id, { roleId: "teamAdmin" });
                    
                console.log(`Team ${name} created !`);
            } else {
                console.log(`Team ${name} exist !`);
            }
        } catch (error) {
            this.helper.wrapError(error);
        }
    }
 
    private setToken(userInfo: JsonObject, token: string) {
        this.helper.setProp("current_login", userInfo.name);
        this.helper.setProp("current_user_type", userInfo.type);
        let tokenProp = <JsonObject>(this.helper.getProp("token") || {});
        tokenProp[<string> userInfo.name] = token;
        this.helper.setProp("token", tokenProp);
    }

    private async getNewPasswordData() : Promise<JsonObject>{
        let oldPass : string;
        let newPass : string;
        let rePass : string;
        
        let answer = await inquirer.prompt([
                 {
                     type: "password",
                     name: "oldPass",
                     message: "current password: ",
                     mask: "*",
                     when: function() {
                         return !oldPass;
                     },
                     validate: function (user : string) {
                         if (!user)
                             return "Password cannot be empty";
                         return true;
                     }
                 },
                 {
                     type: "password",
                     name: "newPass",
                     message: "new password: ",
                     mask: "*",
                     when: function() {
                         return !newPass;
                     },
                     validate: function (password: string) {
                         if (!password)
                             return "Password cannot be empty";
                        
                         return true;
                     }
                 },
                 {
                     type: "password",
                     name: "rePass",
                     message: "retype new password: ",
                     mask: "*",
                     when: function() {
                         return !rePass;
                     },
                     validate: function (password: string) {
                         if (!password)
                             return "Password cannot be empty";
                        
                         return true;
                     }
                 },
             ]);
    
        return answer;
    }
}