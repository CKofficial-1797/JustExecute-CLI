#!/usr/bin/env node

import { input, select } from '@inquirer/prompts';
import { initFrontend } from './commands/frontend';
import { initBackend } from './commands/backend';
import { initFullstack } from './commands/fullstack';

function displayHeader(): void {
    console.log(`
    👋 Welcome to Excela Project Setup Tool
    - Developed by Sonu Hansda
    -----------------------------------------
    `);
}

async function main(): Promise<void> {
    try {
        displayHeader();

        const projectName = await input({ 
            message: 'Enter your project name: ',
            validate: (value) => value.trim() ? true : 'Project name cannot be empty.',
        });

        const projectType = await select({
            message: 'Select project type',
            choices: [
                { name: 'Frontend', value: 'frontend' },
                { name: 'Backend', value: 'backend' },
                { name: 'Fullstack', value: 'fullstack' },
            ],
        });

        switch (projectType) {
            case 'frontend':
                await initFrontend(projectName);
                console.log(`👉 Next steps:\ncd ${projectName}\nnpm install\nnpm run dev`);
                break;
            case 'backend':
                await initBackend(projectName);
                break;
            case 'fullstack':
                await initFullstack(projectName);
                break;
            default:
                console.error('❌ Invalid project type selected.');
        }
    } catch (error) {
        console.error('⚠️ Error:', error);
    }
}

main().catch((err) => {
    console.error('⚠️ Unexpected Error:', err.message || err);
    process.exit(1);
});
