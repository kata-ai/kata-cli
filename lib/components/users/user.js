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
const repl = require("repl");
const util = require("util");
const deasync = require("deasync");
class User extends merapi_1.Component {
    constructor(helper, api) {
        super();
        this.helper = helper;
        this.api = api;
    }
    login(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let currToken = this.helper.getCurrentToken().token;
                if (options.token) {
                    if (!currToken) {
                        currToken = options.token;
                    }
                    this.api.authApi.apiClient.defaultHeaders.Authorization = `Bearer ${currToken}`;
                    let result = yield this.helper.toPromise(this.api.authApi, this.api.authApi.tokensTokenIdGet, options.token);
                    const tokenObj = result.data;
                    if (tokenObj.type === "user") {
                        this.setToken({ name: "user", type: tokenObj.type }, options.token);
                    }
                    else if (tokenObj.type === "team") {
                        result = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, tokenObj.teamId);
                        const team = result.data;
                        this.setToken({ name: team.username, type: tokenObj.type }, options.token);
                    }
                    else {
                        throw new Error("Invalid token");
                    }
                }
                else {
                    let user = (options.user ? options.user : "");
                    let pass = (options.password ? options.password : "");
                    const answer = yield inquirer.prompt([
                        {
                            type: "input",
                            name: "user",
                            message: "username: ",
                            when() {
                                return !user;
                            },
                            validate(user) {
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
                            validate(password) {
                                if (!password) {
                                    return "Password cannot be empty";
                                }
                                return true;
                            }
                        }
                    ]);
                    user = answer.user || user;
                    pass = answer.password || pass;
                    const result = yield this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: user, password: pass });
                    if (!result.data.isLoggedIn && !result.data.id) {
                        console.log(`username or password is incorrect`);
                    }
                    else {
                        const token = result.data.id;
                        this.helper.setProp("first_login", { type: "user", username: user, id: result.data.userId });
                        this.setToken({ name: user, type: "user" }, token);
                        console.log(`Logged in as ${user}`);
                    }
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const answer = yield this.helper.inquirerPrompt([
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
                const result = yield this.helper.delete();
                if (result) {
                    console.log("Logged out");
                }
                else {
                    console.log("Please log in first");
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    switch(type, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const firstLogin = this.helper.getProp("first_login");
                const currentType = this.helper.getProp("current_user_type");
                if (currentType === type) {
                    throw new Error(`Unable to switch : already on ${type}`);
                }
                if (type === "team") {
                    const info = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, firstLogin.id);
                    const teams = info ? info.data.teams.filter((team) => team.username === name) : [];
                    if (teams.length > 0) {
                        const result = yield this.helper.toPromise(this.api.authApi, this.api.authApi.tokensPost, { type: "team", teamId: teams[0].teamId });
                        const token = result.data.id;
                        this.setToken({ name, type: "team" }, token);
                        console.log(`Switched to team ${name}`);
                    }
                    else {
                        console.log("Unable to switch to Team : Invalid team");
                    }
                }
                else {
                    this.helper.setProp("current_login", firstLogin.username);
                    this.helper.setProp("current_user_type", "user");
                    console.log(`Switched to user ${firstLogin.username}`);
                }
            }
            catch (e) {
                console.log(this.helper.wrapError(e));
            }
        });
    }
    changePassword() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passObj = yield this.getNewPasswordData();
                if (passObj.newPass !== passObj.rePass) {
                    throw new Error("Invalid retype password");
                }
                const currentUser = this.helper.getProp("current_login");
                const { data } = yield this.helper.toPromise(this.api.authApi, this.api.authApi.loginPost, { username: currentUser, password: passObj.oldPass });
                if (data) {
                    const result = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdPut, currentUser, { password: passObj.newPass });
                    console.log("Password changed");
                }
                else {
                    console.log("Invalid password");
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    whoami(options) {
        const currentLogin = this.helper.getProp("current_login");
        const currentType = this.helper.getProp("current_user_type");
        console.log(`Current login: ${currentLogin}, login type: ${currentType}`);
    }
    createTeam(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentLogin = this.helper.getProp("current_login");
                const currentUserType = this.helper.getProp("current_user_type");
                if (currentUserType !== "user") {
                    throw new Error("Must be on user to do this operation");
                }
                const { response } = yield this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsPost, { username: name, password: "", roleId: "teamAdmin" });
                if (response && response.body.id) {
                    const { data } = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, currentLogin);
                    const result = yield this.helper.toPromise(this.api.teamApi, this.api.teamApi.teamsTeamIdUsersUserIdPost, response.body.id, data.id, { roleId: "teamAdmin" });
                    console.log(`Team ${name} created !`);
                }
                else {
                    console.log(`Team ${name} exist !`);
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    createUser(username, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const password = yield this.helper.inquirerPrompt([
                {
                    type: "password",
                    name: "answer",
                    message: "password: ",
                    mask: "*",
                    default: null
                }
            ]);
            const confirmPassword = yield this.helper.inquirerPrompt([
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
                let role;
                if (options.admin) {
                    role = "admin";
                }
                else if (options.internal) {
                    role = "internalUser";
                }
                else {
                    role = "user";
                }
                const { data } = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersUserIdGet, username);
                if (data.id) {
                    throw new Error(`Username ${username} exist !`);
                }
                const newUser = yield this.helper.toPromise(this.api.userApi, this.api.userApi.usersPost, { username, password: password.answer, roleId: role });
                console.log(`New user ${newUser.data.username} created !`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    setToken(userInfo, token) {
        this.helper.setProp("current_login", userInfo.name);
        this.helper.setProp("current_user_type", userInfo.type);
        const tokenProp = (this.helper.getProp("token") || {});
        tokenProp[userInfo.name] = token;
        this.helper.setProp("token", tokenProp);
    }
    getNewPasswordData() {
        return __awaiter(this, void 0, void 0, function* () {
            let oldPass;
            let newPass;
            let rePass;
            const answer = yield inquirer.prompt([
                {
                    type: "password",
                    name: "oldPass",
                    message: "current password: ",
                    mask: "*",
                    when() {
                        return !oldPass;
                    },
                    validate(user) {
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
                    validate(password) {
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
                    validate(password, answer) {
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
        });
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map