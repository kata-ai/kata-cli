"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
class Deprecated extends merapi_1.Component {
    addChannel() {
        console.log("This command is deprecated, please use create-channel");
    }
    removeChannel() {
        console.log("This command is deprecated, please use delete-channel");
    }
    configView() {
        console.log("This command is deprecated, please use view-config");
    }
    addMember() {
        console.log("This command is deprecated, please use invite-member");
    }
}
exports.default = Deprecated;
//# sourceMappingURL=deprecated.js.map