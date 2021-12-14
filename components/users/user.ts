import { Component, JsonObject } from "merapi";
import { IHelper } from "interfaces/main";
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors");

export default class User extends Component {

    constructor(private helper: IHelper, private api: any) {
        super();
    }

    public async login(options: JsonObject) {
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
                        validate(user: string) {
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
                        validate(password: string) {
                            if (!password) {
                                return "Password cannot be empty";
                            }

                            return true;
                        }
                    }
                ]);

                user = answer.user || user;
                pass = answer.password || pass;

                const result = await this.helper.toPromise(this.api.authApi, this.api.authApi.cliLoginPost, { username: user, password: pass });
                if (!result.data.isLoggedIn && !result.data.id) {
                    console.log(`username or password is incorrect`);
                } else {
                    const token = result.data.id;

                    this.helper.setProp("first_login", { type: "user", username: user, id: result.data.userId });
                    this.setToken({ name: user, type: "user", namespace: "platform" }, token);

                    console.log(`Logged in as ${colors.green(user)}`);
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

            this.helper.clearCommandSession();
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async switch(type: string, name?: string) {
        try {
            const firstLogin = this.helper.getProp("first_login") as JsonObject;
            const currentType = this.helper.getProp("current_user_type");
            const currentLogin = this.helper.getProp("current_login");
            const username = name ? name : currentLogin;

            if (currentType === type && username === currentLogin) {
                throw new Error(`Unable to switch : already on ${colors.green(currentLogin)} as ${colors.green(type)}`);
            }

            const isImpersonate = this.helper.getProp("isImpersonate");
            if (type === "team") {
                let userId: string;
                if (isImpersonate === true) {
                    const currentLoginName = this.helper.getProp("current_login").toString();
                    userId = (await this.getUserInfo(currentLoginName)).id;
                } else {
                    userId = firstLogin.id.toString();
                }
                const { response } = await this.helper.toPromise(
                    this.api.userApi,
                    this.api.userApi.usersUserIdGet,
                    userId
                );


                if (!response) {
                    throw new Error(`Unable to switch team: ${colors.green(name)}`);
                }

                const teams = response && response.body ?
                    response.body.teams.filter((team: any) => team.username === name) : [];

                if (teams.length > 0) {
                    const team = teams[0];
                    const currentToken = this.helper.getProp("token") as JsonObject || {}
                    const currentLogin = this.helper.getProp("current_login") as string || "user";

                    this.setToken({ name, type: "team" }, currentToken[currentLogin] as string);
                    this.helper.setProp("team_id", team.teamId);
                    this.helper.setProp("current_login", name);
                    this.helper.setProp("current_user_type", "team");
                    console.log(`Switched to team: ${colors.green(name)}`);
                } else {
                    console.log(`Invalid team name. Unable to switch to team: ${colors.red(name)}`);
                }
            } else if (type === "user") {
                if (isImpersonate === true) {
                    // TODO: jika user login sbg admin, impersonate dewi, switch ke team, lalu mau switch ke user yg non-user tsb
                    const userTokenInfo = this.getUserTokenInfo(name);
                    if (!userTokenInfo || userTokenInfo === undefined) {
                        throw new Error(`${colors.red(name)}'s token is not found.`);
                    } else if ( userTokenInfo.userName === "admin") {
                        throw new Error(`Cannot switch to ${colors.red(name)}. Use unimpersonate.`);
                    } else {
                        if (name === userTokenInfo.userName) {
                            this.helper.setProp("current_login", name);
                            this.helper.setProp("current_user_type", "user");
                            console.log(`Switched to user ${colors.green(name)}`);
                        } else {
                            throw new Error(`Unable to switch to user ${colors.red(name)}.`);
                        }
                    }
                } else {
                    this.helper.setProp("current_login", firstLogin.username);
                    this.helper.setProp("current_user_type", "user");
                    console.log(`Switched to user ${colors.green(firstLogin.username)}`);
                }
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


    public whoami(options: JsonObject) {
        const currentLogin = this.helper.getProp("current_login") as string;
        const currentType = this.helper.getProp("current_user_type") as string;
        console.log(`Current login: ${colors.green(currentLogin)}, login type: ${colors.green(currentType)}`);
    }

    public async createTeam(name: string) {
        try {
            const currentLogin = this.helper.getProp("current_login") as string;
            const currentUserType = this.helper.getProp("current_user_type") as string;

            if (currentUserType !== "user") {
                throw new Error("Must be on user to do this operation");
            }

            const { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsPost, { username: name, password: "", roleId: "teamAdmin" });

            if (response && response.body.id) {
                console.log(`Team ${colors.green(name)} created !`);
            } else {
                console.log(`Team ${colors.red(name)} exist !`);
            }
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async createUser(username: string, options?: JsonObject) {
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

            let role: string;
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

            console.log(`New user ${colors.green(newUser.data.username)} created !`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }

    public async impersonate(userName: string) {
        // TODO : dibuat seperti login, pake inquirer.
        try {
            const currentLogin: string = this.helper.getProp("current_login").toString();
            if (currentLogin !== "admin") {
                throw new Error(`Your login status is not superadmin. You are not authorized to impersonate a user`);
            }

            // set currentToken header bearer token
            const currentToken: string = this.helper.getCurrentToken().token.toString();
            this.api.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${currentToken}`;

            // get admin token
            this.api.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${currentToken}`;

            // get user id from username
            const id: string = (await this.getUserInfo(userName)).id;
            const name: string = (await this.getUserInfo(userName)).name;
            const email: string = (await this.getUserInfo(userName)).email;

            if ( name && email ) {
                // userName is user collected input
                if ( userName !== name && userName !== email ) {
                    throw new Error(`Sorry, username is not exist.`);
                }
            } else {
                throw new Error(`Sorry, username is not valid.`);
            }


            // impersonate function
            const result = await this.helper.toPromise(
                this.api.authApi, this.api.authApi.impersonatePost,
                {
                    userId: id,
                    namespace: "platform"
                }
            );

            // set value on .katajson
            const impersonateToken: string = result.data.id.toString();
            const type: string = result.data.type.toString();
            this.helper.setProp("isImpersonate", true);
            this.setToken({ name, type }, impersonateToken);

            console.log(`Succesfully impersonate as ${colors.green(name)}`);

        } catch (error) {
            console.log(this.helper.wrapError(error));

        }
    }

    // unimpersonate command
    public async unimpersonate() {
        try {
            const userName: string = this.helper.getProp("current_login").toString();
            this.helper.deleteKeyToken(userName);
            const currentLogin: string = this.helper.getProp("current_login").toString();
            console.log(`Succesfully unimpersonate user. Now your current login is ${colors.green(currentLogin)}`);
        } catch (error) {
            console.log(this.helper.wrapError(error));
        }
    }


    private setToken(userInfo: JsonObject, token: string) {
        this.helper.setProp("current_login", userInfo.name);
        this.helper.setProp("current_user_type", userInfo.type);
        this.helper.setProp("namespace", userInfo.namespace);
        const tokenProp = (this.helper.getProp("token") || {}) as JsonObject;
        tokenProp[userInfo.name as string] = token;
        this.helper.setProp("token", tokenProp);
    }

    private getUserTokenInfo(name: string) {
        const tokenProp = (this.helper.getProp("token") || {}) as JsonObject;
        if (name in tokenProp) {
            const userName: string = name.toString();
            const token: string  = tokenProp[name as string].toString();
            return {
                userName,
                token
            };
        }
    }

    private async getUserInfo(userName: string) {
        // get userId from currentlogin
        const { response } = await this.helper.toPromise(
            this.api.userApi,
            this.api.userApi.usersGetInfoKeyGet,
            userName,
        );
        const user = response.body;
        const email: string = user.email ? user.email.toString() : "";
        const name: string = user.username.toString();
        const id: string = user.userId.toString();
        return {
            id,
            name,
            email,
         };
    }

    private async getNewPasswordData(): Promise<JsonObject> {
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
                validate(password: string) {
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
                validate(password: string, answer: JsonObject) {
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

    public async forgot(username: string) {
        try {
            const current_login = this.helper.getProp("current_login")
            if (!current_login) {
                const { response } = await this.helper.toPromise(this.api.authApi, this.api.authApi.forgotPost, { username });
                if (response && response.body && response.body.message) {
                    console.log("Please check your email to reset your password.");
                }
            } else {
                console.log(`Please log out first`);
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

    public async listTeam() {
        try {
            const current_login = this.helper.getProp("current_login")
            if (current_login) {
                const { response } = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdTeamsGet, current_login);
                const table = new Table({
                    head: ["Team Name", "Projects", "Members", "Bots"],
                    colWidths: [50, 15, 15, 15]
                });
                response.body.forEach((team: JsonObject) => {
                    table.push([team.username, team.projects, team.members, team.bots]);
                });
                console.log(table.toString());
            } else {
                console.log("Please log in first");
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }

    public async listTeamUser(teamName?: string) {
        try {
            const current_login = this.helper.getProp("current_login")
            if (current_login) {
                const dataTeams = await this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdTeamsGet, current_login);
                const teams: object[] = dataTeams.response.body;
                const choices = teams.map((team: any) => ({
                    name: team.username,
                    value: team.teamId
                }));
                let teamId = null

                if (teamName) {
                    const sameName = choices.find((choice: any) => choice.name === teamName);
                    if (sameName) {
                        teamId = sameName.value
                    }
                } else {
                    const choice = await inquirer.prompt([
                        {
                            type: "list",
                            name: "teamId",
                            message: "Team:",
                            choices: choices
                        }
                    ]);

                    teamId = choice.teamId
                }


                const { response } = await this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersGet, teamId);
                const table = new Table({
                    head: ["Username", "Role"],
                    colWidths: [50, 25]
                });
                response.body.forEach((user: JsonObject) => {
                    table.push([user.username, user.roleName]);
                });
                console.log(table.toString());
            } else {
                console.log("Please log in first");
            }
        } catch (e) {
            console.error(this.helper.wrapError(e));
        }
    }
}
