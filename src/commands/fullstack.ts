import { select } from "@inquirer/prompts";
import { initBackend } from "./backend";
import { initFrontend } from "./frontend";
import { execPromise } from "../utils";
import fs from "fs/promises";


export async function initFullstack(projectName: string) {
    const stackChoice = await select({
        message: "Select fullstack option",
        choices: [
            { name: "MERN Stack", value: "mern" },
            // { name: "Next.js Fullstack", value: "nextjs" },
        ],
    });

    try {
        try {
            await fs.access(projectName);
            console.error(`❌ Directory "${projectName}" already exists. Choose a different name.`);
            return;
        } catch {
           
        }

        if (stackChoice === "mern") {
            await setupMERNStack(projectName);
        } else if (stackChoice === "nextjs") {
            await setupNextJSStack(projectName);
        } else {
            console.error(`❌ Unsupported stack choice: ${stackChoice}`);
        }
    } catch (error) {
        console.error("Failed to initialize fullstack project:", error);
    }
}


async function setupMERNStack(projectName: string) {
    console.log(`🚀 Setting up MERN stack for "${projectName}"...`);
    try {
        console.log("⚙️ Initializing frontend...");
        await initFrontend(`${projectName}/frontend`);
    } catch (error) {
        console.error(`❌ Failed to initialize frontend: ${error}`);
    }

    try {
        console.log("⚙️ Initializing backend...");
        await initBackend(`${projectName}`, false);
    } catch (error) {
        console.error(`❌ Failed to initialize backend: ${error}`);
    }

    console.log(`🎉 MERN stack initialized successfully for "${projectName}".`);
}


async function setupNextJSStack(projectName: string) {
    console.log(`🚀 Setting up Next.js fullstack for "${projectName}"...`);

    const language = await select({
        message: "Select project language for Next.js",
        choices: [
            { name: "JavaScript", value: "javascript" },
            { name: "TypeScript", value: "typescript" },
        ],
    });

    const command =
        language === "typescript"
            ? `npx create-next-app@latest ${projectName} --typescript`
            : `npx create-next-app@latest ${projectName}`;

    console.log(`⚙️ Running command for Next.js setup: ${command}`);
    try {
        const { stderr } = await execPromise(command);

        if (stderr) {
            console.error(`❌ Error initializing Next.js project: ${stderr}`);
        } else {
            console.log(`🎉 Next.js fullstack initialized successfully for "${projectName}".`);
            console.log(`👉 Next steps:\ncd ${projectName}\nnpm install\nnpm run dev`);
        }
    } catch (error) {
        console.error(`❌ Failed to initialize Next.js project: ${error}`);
    }
}