[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5445d7e1a31740f8a4659e4774a168d9)](https://www.codacy.com?utm_source=git@bitbucket.org&amp;utm_medium=referral&amp;utm_content=yesboss/Kata-CLI&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/kata-ai/kata-cli/badge.svg)](https://snyk.io/test/github/kata-ai/kata-cli)
[![NPM version](https://img.shields.io/npm/v/kata-cli.svg?style=flat)](https://www.npmjs.com/package/kata-cli)
[![NPM downloads](https://img.shields.io/npm/dm/kata-cli.svg?style=flat)](https://www.npmjs.com/package/kata-cli)

# Kata-CLI Overview and Command Reference
Kata Command Line Interface (Kata CLI) is a tool for creating bots with Kata Markup Language (Kata ML) and helps managing the bots with command line/shell of various operating systems.

## Installing Kata-CLI
Install Kata-CLI using the npm package manager.

```shell
npm install -g kata-cli
```

This is the preferred method to install Kata-CLI in a global mode, as it will always install the most recent stable release.

### Changelog
For details about changes between versions, and information about updating from previous releases, see the [Changelog](CHANGELOG.md)

### Upgrade Kata-CLI version
To check your installed Kata-CLI version, use this command:

  ```shell
  ➜   kata --version
  ```

Please refer to the full descriptions on [Changelog](CHANGELOG.md) to check the latest version. *Make sure to update Kata-CLI to the latest stable version before doing some fun with your Bot with this command*:

  ```shell
  ➜  npm i -g kata-cli@x.y.z
  ```

you can add `@version-number` to be exact.

## Command Overview

Use `kata --help` into your command line to find out the list of commands offered by Kata-CLI with a short description. The new command in Kata-CLI is that with asterisk (*).

### User Management
The list of command below is accessible by user with role as **user** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata login [options]` | the parameter `options` can be `user` or `team`
`kata whoami` | to see the current user login informations
`kata change-password` | to change user's password
`kata create-team <teamName>` | to create team
`kata logout` | to logout from the platform
(*) `kata forgot-password <userName>` | to set new password when user forgot
(*) `kata list-team` | to list user's team
(*) `kata list-team-user [teamName]` | to list user's team member

This command is accessible by user with role as **admin** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-user` | to set spesific role and create user

Command as **team** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata add-member <userName> [options] --admin` | to assign user as the teammember
`kata remove-member <userName>` | to remove member from the team
`kata switch <roleType> [userName or teamName]` | to switch between `user` and `team` role. Parameter <roleType> must be `user` or `team`.

### Project Management Command

The new commands (on version 2.4.0) to manage Project are those with asterisk (*).

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-project` | to create a project
`kata list-project` | to display current projects that you have
`kata select-project` | to select project that you want to use, any bot operation will be related to that project
(*) `kata delete-project [projectName]` | to delete project
(*) `kata update-project [projectName]` | to update project details

### Bot, Deployment, Environment and Channel Management Command

#### Bot Management Command

Here are list of commands to manage Bot, those with asterisk (*) are the the new commands on version 2.4.0

Commands | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
(*) `kata view-config` | to view user configurations
`kata init <botName>` | to initialize the bot
`kata revisions` | to list the revisions of the bot
`kata list-bots` | to list the bots
`kata push` | to push the bot revision
`kata pull [revision]` | to pull the bot with specified name and version
`kata remove-bot` | to delete selected bot
`kata test [fileName]` | to run a test for the bot
`kata console [revision]` | to converse with the bot, updated features: user can choose certain environment console
`kata drop <botName>` | to drop bot
`kata set <property> <value>` | to set configuration setting on Kata-CLI
(*) `kata errors` | to list error log from a bot

#### Deployment Management Command

Here are list of commands to manage Deployment, those with asterisk (*) are the the new commands on version 2.4.0

Commands | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-deployment` | to create a deployment
`kata list-deployment` | to list deployments
(*) `kata rollback-deployment <version>` | to rollback to certain deployment

#### Environment Management Command

Here are list of commands to manage Environment, those with asterisk (*) are the the new commands on version 2.4.0

Commands | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-environment <slug>` | Create an environment on the selected project
`kata list-environment` | List environments of the selected project
`kata update-environment <newDeploymentVersion>` | Update an environment of the selected project

#### Channel Management Command

Here are list of commands to manage Channel, those with asterisk (*) are the the new commands on version 2.4.0

Commands | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
(*) `kata add-channel [options] <channelName>` | Create a channel with channelName on the selected environment
(*) `kata update-channel [options] <channelName>` | Update a channel on the selected environment
`kata list-channel` | List channels of the selected environment
`kata remove-channel <channelName>` | Remove the channel named channelName from the selected environment

### NLU Related Command

Here are list of commands to manage NLU, those with asterisk (*) are the the new commands on version 2.4.0

Commands | Functionalities
---------|-----------------
`kata nl-init` | to initialize nl definition
`kata nl-push` | to push nl changes
`kata nl-pull` | to pull nl changes from remote
`kata nl-train [options]` | to train a sentence or a batch of sentences. `[options]` can be `-f <trainPath/fileName.txt>`
`kata nl-predict [options]` | to predict a sentence. `[options]` can be `[-f <predictPath/fileName.txt>]`
`kata list-profiles` | to list all profiles
`kata nl-snapshot` | to save the nlu snapshot
(*) `kata nl-list-training --page=<pageNumber>` | to list the training sentences
(*) `kata nl-list-prediction --page=<pageNumber>` | to list the prediction log
(*) `kata nl-list-revision` | to list the revision
(*) `kata nl-issue-token` | to (re-)issue token

### Outdated Commands on Kata-CLI

Here are the list of outdated commands on version 2.4.0, please refer to [Changelog](CHANGELOG.md) for the details.

_List of Deprecated Command:_
- `kata add-channel <channelName>`
- `kata edit-channel <channelName>`
- `kata config-view`
- `kata add-member`

_List of Permanently Deleted Command:_
- `kata deploy <name> [version]`
- `kata session-get <id> [deploymentId]`
- `kata session-create <id> [deploymentId]`
- `kata session-update <id> [deploymentId]`
- `kata session-delete <id> [deploymentId]`
- `kata timestamp`


## Workflow

We hope that you can get a smooth experience in working with Kata-CLI by following several best practice steps:

### Project Workspace

In Kata-CLI upto 2.0 version, we introduce Project Environment on the top of the Bots, Deployment, Environment, NLU and CMS. Hence, before running Kata-CLI main command, such as: `kata init`,`kata push`, `kata console`., user have to initiate and define the Project that they are going to work on.

#### 1. Create the Project

Welcome to your project workspace. In this documentation, you may find the term `project` and `bot` is used interchangeably, since a bot belongs to a project.

For the first step, create folder where we're going to wrap our project in. Then let's create our first project, where a bot, deployments, environments and channels are attached to.

  ```shell
  ➜ kata create-project
  ? Project name: your-project-name
  ? Timezone (UTC) 7
  ? Project description: your-project-desc
  ? NLU Language id
  ? Is private Nlu? Yes
    Project "your-project-name" (5c9ea2b9-ab79-4aa8-aaa0-a831bbb175de) is successfully created
  ```

Voila, your first project is there.

If you already have an existing project that you're gonna be working on, you have to select the project first. To show the list of your project, run this command:

  ```shell
  ➜ kata select-project
  ```

#### 2. Create the Bot

Once the project is selected, it is the time to build the bot using this command:

  ```shell
  ➜ kata init <your-bot-name>
  ```

This command will generate a `bot.yml` under the project. This file contains a simple `hi-bot` template written in Kata Markup Language (Kata-ML) schema, as the first revision of your bot.

Run this command to see the list of bot revisions:

  ```shell
  ➜ kata revisions
  ```

#### 3. Push your bot changes

Customize your bot schema on `bot.yml` file, then push the bot to apply the changes:

  ```shell
  ➜ kata push
    Push Bot Success. Revision : 6bb61b7
  ```

#### 4. Test a conversation with your bot

Once you pushed the latest revision of your bot, meaning that you are ready to test a conversation with the bot. Run this command on your terminal:

  ```shell
  ➜ kata console
  ```

We'll enter the virtual environment (node shell) to do a chatting simulation with the bot.

  ```shell
    your-bot-name>text("hi")
    { messages:
      [ { type: 'text',
          content: 'hi',
          id: 'd5a1a010-fb60-42cf-96c8-c648fc557443',
          intent: 'greeting',
          attributes: {} } ],
      responses:
      [ { type: 'text',
          content: 'hialo!',
          action: 'text',
          id: '1f7caf54-ee6f-4aa6-9696-bdcced9e406a',
          refId: 'd5a1a010-fb60-42cf-96c8-c648fc557443',
          flow: 'hello',
          intent: 'greeting' } ],
      session:
      { id: 'test~from~console',
        states: {},
        contexes: {},
        history: [],
        current: null,
        meta: { lastFlow: 'hello', lastState: 'greet', end: true },
        timestamp: 0,
        data: {} },
      duration: 86 }
    your-bot-name>
    (To exit, press ^C again or type .exit)
  ```

Kata-CLI will create a session that alive along the conversation and generate a `.katasession` file in your home directory for further debugging (if needed).

To view your current session, you can either run this command:

  ```shell
  ➜  cat ~/.katasession
  {"id":"test~from~console","states":{},"contexes":{},"history":[],"current":null,"meta":{"lastFlow":"hello","lastState":"other","end":true},"timestamp":0,"data":{}}%
  ```

or this command, for a better JSON alignment:

  ```shell
  ➜   kata console
      your-bot-name>current()
        {
          id: 'test~from~console',
          states: {},
          contexes: {},
          history: [],
          current: null,
          meta: { lastFlow: 'hello', lastState: 'other', end: true },
          timestamp: 0,
          data: {}
        }
  ```

Congratulations that you finish your first revision of the bot. Now it is the time to deploy your bot.

### Deploy your Project

Follow these following steps to deploy your project to messaging channels.

#### 1. Create a Deployment

Create a new deployment version using these command. If you do not specificy the deployment types (`major`/`minor`/`patch`), it will automatically create a deployment with patch.

  ```shell
  ➜  kata create-deployment [deploymentType]
  ```

#### 2. Create and Update Environment
After having the deployment, we need to create an environment. Environment works like tier in which a your bot is deployed and executed. We provide three stages of environments: `Development`, `Staging`, `Production`.

  ```shell
  ➜  kata create-environment <slugName>
  ```

Your freshly created environment will auto-select the latest deployment version.

If you already have environment, you can just simply update it with the newer deployment version using this command:

  ```shell
  ➜  kata update-environment <newDeploymentVersion>
  ```

#### 3. Create Channel
Let's create messaging channel under environment. The steps are: type the command to create channel below, then choose the environment where it belongs to.

  ```shell
  ➜  kata create-channel <channelName>
  ```

(*) Notes:
Previously, the command to create channel is:
`kata add-channel <channelName>`
From this version above, the command is changed to:
`kata create-channel <channelName>`

### Integrate with NLU

An NLU must be under a project. Therefore, we need to define a project, before we create an NLU.

#### 1. Initialize NLU Project

It would create a new file `nlu.yml` in which the nlu structure can be defined.

  ```shell
  # initialize a nlu project
  ➜  kata nl-init
  ```

#### 2. Push NLU

To use push command to create and update the NLU

  ```shell
  # push current nlu project
  ➜  kata nl-push
  ```

#### 3. List Profiles

To list all profiles

  ```shell
  ➜  kata list-profiles
  ```

#### 4. Train NLU

To train a nlu.

  ```shell
  ➜  kata nl-train [-f <trainPath/filename.txt>]
  ➜  kata nl-train [-s <sentence>]
  ```

#### 5. Predict Sentences with NLU

  ```shell
  ➜  kata nl-predict [-f <trainPath/filename.txt>]
  ➜  kata nl-predict [-s <sentence>]
  ```

## Contributing

Is something missing/incorrect? Please let us know by contacting support@kata.ai. If you know how to fix it straight away, don’t hesitate to create a pull request on this documentation’s GitHub repository by following these steps:
1. Fork this repository
2. Name your branch with prefix `feature/` if you added new feature, `hotfix/` if you fixed some bugs
3. Code, and dont forget to add test after added new feature
4. Commit your branch and pull request to base `develop` branch

Happy contributing :)
