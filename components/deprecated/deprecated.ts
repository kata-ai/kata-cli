import { Component } from "merapi";

export default class Deprecated extends Component {
    public addChannel() {
        console.log("This command is deprecated, please use create-channel");
    }

    public removeChannel() {
        console.log("This command is deprecated, please use delete-channel");
    }

    public configView() {
        console.log("This command is deprecated, please use view-config");
    }

    public addMember() {
        console.log("This command is deprecated, please use invite-member");
    }
}
