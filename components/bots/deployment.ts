
import { IHelper } from "interfaces/main";
import { JsonObject } from "merapi";
const Table = require("cli-table");

export default class Deployment {
    constructor(private helper: IHelper, private api: any) {
    }

    // upsert deployment
    // public async deploy(name: string, label: string, options: JsonObject) {
    //     let deployment;
    //     const projectId = this.helper.getProjectId();
    //     const versionRegex = /^\d+\.\d+\.\d+$/g;
    //     let tag: string = "";
    //     let version: string = "";

    //     try {
    //         // get bot revisions
    //         const { data } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, projectId);
    //         const history = await this.getBotRevisions(projectId);

    //         if (label) {
    //             const isVersion = versionRegex.test(label);
    //             const latestTag = history.data.filter((x: JsonObject) => {
    //                 const cond = isVersion ? x.revision : x.tag;

    //                 return label === cond;
    //             });

    //             if (latestTag.length > 0) {
    //                 const selectedBot = latestTag[latestTag.length - 1];
    //                 version = selectedBot.revision;
    //                 tag = isVersion ? selectedBot.tag ? selectedBot.tag : null : label;
    //             } else {
    //                 throw new Error("INVALID TAG");
    //             }
    //         } else {
    //             version = data.latest;
    //             tag = "latest";
    //         }


    //         if (!history.data.some((v: JsonObject) => v.revision === version)) {
    //             throw new Error("INVALID_VERSION");
    //         }


    //     } catch (e) {
    //         console.log(this.helper.wrapError(e));
    //         return;
    //     }

    //     try {
    //         // get latest? deploymen
    //         // const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdGet, botId, name);
    //         const { data } = await this.helper.toPromise(
    //             this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentGet, projectId
    //         );

    //         deployment = data;
    //     } catch (e) {
    //         if (e.status !== 400) {
    //             console.log(this.helper.wrapError(e));

    //             return;
    //         }
    //     }

    //     try {
    //         if (!deployment) {
    //             const body = {
    //                 name,
    //                 botVersion: version,
    //                 channels: {}
    //             }
    //             const opts = { body };

    //             // create deployment, nanti handle environment juga
    //             // this.createDeployment(projectId, opts)
    //             this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost(body, projectId)
    //             const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsPost, projectId, opts);

    //             console.log("CREATED NEW SUCCESSFULLY");
    //             console.dir({ ...data, tag }, { depth: null });
    //             return;
    //         }

    //         const body = {
    //             name,
    //             botVersion: version
    //         };

    //         // update deployment,
    //         // harusnya update atau create new deployment revision?
    //         // how to get deployment environment
    //         // this.updateDeployment( botId, name, body)
    //         const [major, minor, patch] = version.split(".").map(Number);
    //         const newversion = `${major}.${minor}.${patch + 1}`;
    //         // this.createDeployment(id, newversion)
    //         const { data } = await this.helper.toPromise(this.api.deploymentApi, this.api.deploymentApi.botsBotIdDeploymentsDeploymentIdPut, projectId, name, body);

    //         console.log("CREATED NEW DEPLOYMENT REVISION SUCCESSFULLY");
    //         console.dir({ ...data, tag }, { depth: null });
    //     } catch (e) {
    //         console.log(this.helper.wrapError(e));
    //     }
    // }

    public async create() {
        const projectId = this.helper.getProjectId();
        const { response: { body: project } } = await this.helper.toPromise(
            this.api.projectApi, this.api.projectApi.projectsProjectIdGet,
            projectId
        );

        try {
            // const { response: { body: deployments } } = await this.helper.toPromise(
            //     this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentsVersionsVersionGet,
            //     projectId

            // );
            // console.log(deployments)

            const postBody = {
                version: "0.0.1",
                botRevision: project.botLatestRevision,
                modules: (null as any),
            };
            console.log(postBody)



            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsPost,
                postBody, projectId,
            );

            console.log(body);
            // if (body && Object.keys())
            console.log("DEPLOYMENT CREATED SUCCESSFULLY");
        } catch (e) {
            console.error("Error")
            console.log(this.helper.wrapError(e));
        }
    }

    public async list(options: JsonObject) {
        const projectId = this.helper.getProjectId();

        try {
            const { response: { body } } = await this.helper.toPromise(
                this.api.deploymentApi, this.api.deploymentApi.projectsProjectIdDeploymentVersionsGet, projectId, {}
            );

            if (body && body.data) {
                const table = new Table({
                    head: ["Deployment Name", "Deployment Version", "Bot Revision"],
                    colWidths: [30, 30, 42]
                });
                body.data.forEach((deployment: JsonObject) => {
                    table.push([deployment.name, deployment.version, deployment.botRevision]);
                });

                console.log(table.toString());
            }
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }
}
