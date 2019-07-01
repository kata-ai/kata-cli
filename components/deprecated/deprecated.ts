import { Component } from "merapi";

export default class Deprecated extends Component {
    addChannel() {
        console.log('This command is deprecated, please use insert-channel')
    }

    removeChannel() {
        console.log('This command is deprecated, please use delete-channel')
    }

    configView() {
        console.log('This command is deprecated, please use view-config')
    }

    addMember() {
        console.log('This command is deprecated, please use invite-member')
    }
}