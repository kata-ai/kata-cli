import { Component, JsonObject, IHash, Config, Json } from "merapi";
import { v4 as uuid } from "uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const repl = require("repl");
const util = require("util");
const deasync = require("deasync");

export default class User extends Component {

    constructor(private helper : IHelper, private api : any) {
        super();
    }

    public async login(options : JsonObject) {
        try {
            let currToken = this.helper.getCurrentToken().token;
            if (options.token) {
                if (!currToken) {
                    currToken = options.token as string;
                }

                this.api.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${currToken}`;
                let result = await this.helper.toPromise(this.api.authApi, this.api.authApi.tokensTokenIdGet, options.token);
                const tokenObj = result.data;

                if (tokenObj.type === "user") {
                    this.setToken({ name: "user", type: tokenObj.type }, options.token as string);
                } else if (tokenObj.type === "team") {
                    result = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, tokenObj.teamId);
                    const team = result.data;

                    this.setToken({ name: team.username, type: tokenObj.type }, options.token as string);
                } else {
                    throw new Error("Invalid token");
                }
            } else {
                let user = (options.user ? options.user : "") as string;
                let pass = (options.password ? options.password : "") as string;

                const answer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "user",
                        message: "username: ",
                        when() {
                            return !user;
                        },
                        validate(user : string) {
                            if (!user) {
                                return "Username cannot be empty";
                            }

                            return true;
                        }
                    },
                    {
                        type: "password",
                        name: "password",
                        message: "password: ",
                        mask: "*",
                        when() {
                            return !pass;
                        },
                        validate(password : string) {
                            if (!password) {
                                return "Password cannot be empty";
                            }

                            return true;
                        }
                    }
                ]);

                user = answer.user || user;
                pass = answer.password || pass;

                const result = await this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: user, password: pass });
                if (!result.data.isLoggedIn && !result.data.id) {
                    console.log(`username or password is incorrect`);
                } else {
                    const token = result.data.id;

                    this.helper.setProp("first_login", { type: "user", username: user });
                    this.setToken({ name: user, type: "user" }, token);

                    console.log(`Logged in as ${user}`);
                }
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async logout() {
        const answer = await this.helper.inquirerPrompt([
            {
                type: "confirm",
                name: "confirmation",
                message: "Do you want to log out ?",
                default: false
            }
        ]);

        if (!answer.confirmation) {
            return;
        }

        try {
            const result = await this.helper.delete();
            if (result) {
                console.log("Logged out");
            } else {
                console.log("Please log in first");
            }

        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async switch(type : string, name? : string) {
        try {
            const firstLogin = this.helper.getProp("first_login") as JsonObject;
            const currentType = this.helper.getProp("current_user_type");

            if (currentType === type) {
                throw new Error(`Unable to switch : already on ${type}`);
            }

            if (type === "team") {
                const info = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, firstLogin.username);
                const { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, name);
                const teams = info ? info.data.teams.map((x : any) => x.teamId) : [];

                if (data && teams.indexOf(data.id) > -1) {
                    const result = await this.helper.toPromise(this.api.authApi, this.api.authApi.tokensPost, { type: "team", teamId: data.id });
                    const token = result.data.id;
                    this.setToken({ name, type: "team" }, token);
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
            console.log(this.helper.wrapError(e));
        }
    }

    public async changePassword() {
        try {
            const passObj = await this.getNewPasswordData();
            if (passObj.newPass !== passObj.rePass) {
                throw new Error("Invalid retype password");
            }

            const currentUser = this.helper.getProp("current_login") as string;
            const { data } = await this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: currentUser, password: passObj.oldPass });
            if (data) {
                const result = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdPut, currentUser, { password: passObj.newPass });
                console.log("Password changed");
            } else {
                console.log("Invalid password");
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }


    public whoami(options : JsonObject) {
        const currentLogin = this.helper.getProp("current_login") as string;
        const currentType = this.helper.getProp("current_user_type") as string;
        console.log(`Current login: ${currentLogin}, login type: ${currentType}`);
    }

    public async createTeam(name : string) {
        try {
            const currentLogin = this.helper.getProp("current_login") as string;
            const currentUserType = this.helper.getProp("current_user_type") as string;

            if (currentUserType !== "user") {
                throw new Error("Must be on user to do this operation");
            }

            const { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsPost, { username: name, password: "", roleId: "teamAdmin" });

            if (response && response.body.id) {
                const { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);
                const result = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, response.body.id, data.id, { roleId: "teamAdmin" });

                console.log(`Team ${name} created !`);
            } else {
                console.log(`Team ${name} exist !`);
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async createUser(username : string, options? : JsonObject) {
        const password = await this.helper.inquirerPrompt([
            {
                type: "password",
                name: "answer",
                message: "password: ",
                mask: "*",
                default: null
            }]);

        const confirmPassword = await this.helper.inquirerPrompt([
            {
                type: "password",
                name: "answer",
                message: "retype password: ",
                mask: "*",
                default: null
            }
        ]);
        try {

            if (password.answer !== confirmPassword.answer) {
                throw new Error("Invalid retype password");
            }

            let role : string;
            if (options.admin) {
                role = "admin";
            } else if (options.internal) {
                role = "internalUser";
            } else {
                role = "user";
            }

            const { data } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, username);

            if (data.id) {
                throw new Error(`Username ${username} exist !`);
            }

            const newUser = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersPost, { username, password: password.answer, roleId: role });

            console.log(`New user ${newUser.data.username} created !`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    private setToken(userInfo : JsonObject, token : string) {
        this.helper.setProp("current_login", userInfo.name);
        this.helper.setProp("current_user_type", userInfo.type);
        const tokenProp = (this.helper.getProp("token") || {}) as JsonObject;
        tokenProp[userInfo.name as string] = token;
        this.helper.setProp("token", tokenProp);
    }

    private async getNewPasswordData() : Promise<JsonObject> {
        let oldPass : string;
        let newPass : string;
        let rePass : string;

        const answer = await inquirer.prompt([
            {
                type: "password",
                name: "oldPass",
                message: "current password: ",
                mask: "*",
                when() {
                    return !oldPass;
                },
                validate(user : string) {
                    if (!user) {
                        return "Password cannot be empty";
                    }
                    return true;
                }
            },
            {
                type: "password",
                name: "newPass",
                message: "new password: ",
                mask: "*",
                when() {
                    return !newPass;
                },
                validate(password : string) {
                    if (!password) {
                        return "Password cannot be empty";
                    }

                    return true;
                }
            },
            {
                type: "password",
                name: "rePass",
                message: "retype new password: ",
                mask: "*",
                when() {
                    return !rePass;
                },
                validate(password : string, answer : JsonObject) {
                    if (!password) {
                        return "Password cannot be empty";
                    }

                    if (password !== answer.newPass) {
                        return "Invalid retype password";
                    }

                    return true;
                }
            },
        ]);

        return answer;
    }
}
