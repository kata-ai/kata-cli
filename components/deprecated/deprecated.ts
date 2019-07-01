import { Component } from "merapi";

export default class Deprecated extends Component {
    addChannel() {
        console.log('This command is deprecated, please user insert-channel')
    }

    removeChannel() {
        console.log('This command is deprecated, please user delete-channel')
    }

    configView() {
        console.log('This command is deprecated, please user view-config')
    }

    addMember() {
        console.log('This command is deprecated, please user invite-member')
    }
}