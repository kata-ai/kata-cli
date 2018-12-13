[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5445d7e1a31740f8a4659e4774a168d9)](https://www.codacy.com?utm_source=git@bitbucket.org&amp;utm_medium=referral&amp;utm_content=yesboss/Kata-CLI&amp;utm_campaign=Badge_Grade)

# Introduction to Kata-CLI 2.0
Kata Command Line Interface (Kata CLI) is a tool for creating bots with Kata Markup Language (Kata ML) and helps managing the bots with command line/shell of various operating systems.
For more information, check our website (http://kata.ai/en).

# Changelog 
- [Changelog](CHANGELOG.md)

# Installation
To install Kata-CLI in global mode, run this command in your terminal:
```shell
npm install -g Kata-CLI
```
This is the preferred method to install Kata-CLI, as it will always install the most recent stable release.

# Upgrading to 2.0
We upgraded Kata-CLI version into 2.0 along with our Platform to 3.0. There are a number of small backwards incompatible changes with version 2.0. See the full descriptions [here](CHANGELOG.md). *Make sure to update Kata-CLI to our latest stable version before doing some fun with your Bot*.

```shell
// check kata-cli current version
➜  kata --version
   Kata CLI version 1.2.3
```

```shell
// upgrade kata-cli to the latest version
➜  npm i -g Kata-CLI
```

or to be exact, you can add `@version-number`

```shell 
➜  npm i -g Kata-CLI@2.x.x
```

Then, check kata-cli upgraded version.
```shell
➜  kata --version
   Kata CLI version 2.0.4
```

In Kata-CLI 2.0, we introduce Project Environment on the top of the Bots, NLU and CMS. Hence, before running Kata-CLI main command, such as: `kata init`,`kata push`, `kata console`, etc., user have to define the Project that they are working on using this command. 

```
➜  kata select-project
```

# Command Listings
Use `kata --help` into your command line to see the list of commands offered by Kata-CLI.

The list of command below is accessible by user with role as **user** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata login [options]` | the parameter `options` can be `user` or `team`
`kata whoami` | to see the current user login informations
`kata change-password` | to change user's password
`kata create-team <teamName>` | to create team
`kata logout` | to logout from the platform

This command is accessible by user with role as **admin** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-user` | to set spesific role and create user 

Command as **team** :

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata add-member <userName> [options] --admin` | to assign user as the teammember
`kata remove-member <userName>` | to remove member from the team

The list of command below is accessible by user with role as **user** and **team**:   

**Project environment related command**  
We implement several new commands to manage Project: 

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata create-project` | to create a project
`kata list-project` | to display current projects that you have
`kata select-project` | to select project that you want to use, any bot operation will be related to that project

**Bot related command**  
Please notice that there are also updated commands from the Bot Environment:

Commands  | Functionalities
--------------------- | -------------------------------------------------------------------------------------------
`kata init <botName>` | to initialize the bot
`kata revisions` | to list the revisions of the bot
`kata config-view` | to view user configurations
`kata list-bots` | to list the bots
`kata push` | to push the bot revision
`kata pull [revision]` | to pull the bot with specified name and version
`kata remove-bot` | to delete selected bot
`kata test [fileName]` | to run a test for the bot 
`kata console [revision]` | to converse with the bot
`kata create-deployment` | Create a Deployment
`kata list-deployment` | List Deployments
`kata create-environment <slug>` | Create an environment on the selected project
`kata list-environment` | List environments of the selected project
`kata update-environment <newDeploymentVersion>` | Update an environment of the selected project
`kata add-channel [options] <channelName>` | Create a channel with channelName on the selected environment
`kata list-channel` | List channels of the selected environment
`kata remove-channel <channelName>` | Remove the channel named channelName from the selected environment
`kata drop <botName>` | to drop bot 
`kata set <prop> <value>` | 
`kata switch <roleType> [userName or teamName]` | to switch between `user` and `team` role. Parameter <roleType> must be `user` or `team`.

**Deprecated Commands**


_Permanently deprecated:_
* `kata deploy <name> [version]`
* `kata session-get <id> [deploymentId]`
* `kata session-create <id> [deploymentId]`
* `kata session-update <id> [deploymentId]`
* `kata session-delete <id> [deploymentId]`

# Best Practice
We hope that you can get a smooth experience in working with Kata-CLI by following several best practice steps: 

**1. Login to the platform**


First of all, we need to login into platform using `kata login`

```
➜ kata login
? username:  your-username
? password:  *************
Logged in as your-username
```

**2. Create the Project**


Welcome to your workspace. Now, it is time to create a project on it.
```shell
➜ kata create-project
? Project name: your-project-name
? Timezone (UTC) 7
? Project description: your-project-desc
? NLU Language id
? Is private Nlu? Yes
Project "your-project-name" (5c9ea2b9-ab79-4aa8-aaa0-a831bbb175de) is successfully created
```
Voila, your first project is there. To see the list of your project, run this command:  
``` shell 
➜ kata select-project
```
then select the existing projects that you're gonna working on.

**3. Create the Bot**


Once the project is selected, then it is the turn to build the bot!
```shell
➜ kata init your-bot-name
```
This command will generate a `bot.yml` file containing a simple hi-bot, as the first revision of your bot. 

To see the list of bot revisions, run this command: 
```shell
➜ kata-revisions
```

**4. Push your bot changes**


Customize your bot on `bot.yml` file, then push the bot: 
```shell
➜ kata push
Push Bot Success. Revision : 6bb61b7
```

**5. Make a conversation with your bot!**


Once you pushed the latest revision of your bot, that means you are ready to test a conversation with your bot. Run this command on your terminal
```shell
➜ kata console
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
➜  `kata console`
    your-bot-name>current()
    { id: 'test~from~console',
    states: {},
    contexes: {},
    history: [],
    current: null,
    meta: { lastFlow: 'hello', lastState: 'other', end: true },
    timestamp: 0,
    data: {} }
```

**6. Logout**


Congratulations that you finish your first revision of the bot. Now, it is the time to logout from the platform.
```shell
➜  kata logout 
```
```


# NLU Project
An NLU must be under a project. Therefore, we need to define a project, before we create an NLU.

## Command listings

Commands | Functionalities
---------|-----------------
`kata nl-init` | to initialize nl definition
`kata nl-push` | to push nl changes
`kata nl-pull` | to pull nl changes from remote
`kata nl-train [options]` | to train a sentence or a batch of sentences. `[options]` can be `-f <trainPath/fileName.txt>`
`kata nl-predict [options]` | to predict a sentence. `[options]` can be `[-f <predictPath/fileName.txt>]`
`kata list-profiles` | to list all profiles
`kata nl-snapshot` | to save the nlu snapshot

## NLU Project Best Practice

*Initialize NLU Project*

It would create a new file `nlu.yml` in which the nlu structure can be defined.

```shell
# initialize a nlu project
➜  kata nl-init
```

*Push NLU*

To use push command to create and update the NLU

```shell
# push current nlu project
➜  kata nl-push
```

*List Profiles*

To list all profiles

```shell
➜  kata list-profiles
```

*Train NLU*

To train a nlu.

```shell
➜  kata nl-train [-f <trainPath/filename.txt>]
➜  kata nl-train [-s <sentence>]
```

*Predict Sentences with NLU*

```
➜  kata nl-predict [-f <trainPath/filename.txt>]
➜  kata nl-predict [-s <sentence>]
```

*Contributing to the Documentation*
Is something missing/incorrect? Please let us know by contacting support@kata.ai. If you know how to fix it straight away, don’t hesitate to create a pull request on this documentation’s GitHub repository.

```