import { select } from '@inquirer/prompts';
import { execPromise } from '../utils';
import fs from 'fs/promises';

export async function initFrontend(projectName: string) {
    const language = await select({
        message: 'Select project language',
        choices: [
            { name: 'JavaScript', value: 'javascript' },
            { name: 'TypeScript', value: 'typescript' },
        ],
    });

    const buildTool = await select({
        message: 'Select build tool',
        choices: [
            { name: 'Vite', value: 'vite' },
            { name: 'Create React App', value: 'create-react-app' },
        ],
    });

    const includeTailwind = await select({
        message: 'Do you want to include Tailwind CSS?',
        choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
        ],
    });

    try {
        try {
            await fs.access(projectName);
            console.error(`❌ Directory "${projectName}" already exists. Choose a different name.`);
            return;
        } catch {

        }

        await fs.mkdir(projectName);

        process.chdir(projectName);

        const command = buildTool === 'vite'
            ? language === 'typescript'
                ? `npm create vite@latest . -- --template react-ts`
                : `npm create vite@latest . -- --template react`
            : language === 'typescript'
                ? `npx create-react-app . --template typescript`
                : `npx create-react-app .`;

        console.log(`🚀 Setting up the ${buildTool} project...`);
        const { stderr } = await execPromise(command);

        if (stderr) {
            console.error(`❌ Error initializing frontend project: ${stderr}`);
            return;
        }

        if (includeTailwind) {
            console.log(`🌟 Installing Tailwind CSS...`);
            const tailwindCommand = `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`;
            await execPromise(tailwindCommand);

            const tailwindConfigContent = `
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
};
            `;
            await fs.writeFile('tailwind.config.js', tailwindConfigContent.trim());
            console.log(`✅ Tailwind configuration file created.`);

            const cssFilePath = 'src/index.css';
            const tailwindDirectives = `
@tailwind base;
@tailwind components;
@tailwind utilities;
            `;

            const existingCSS = await fs.readFile(cssFilePath, 'utf8').catch(() => '');
            if (!existingCSS.includes('@tailwind')) {
                const updatedCSS = tailwindDirectives.trim() + '\n' + existingCSS;
                await fs.writeFile(cssFilePath, updatedCSS);
                console.log(`✅ Tailwind directives added to the beginning of ${cssFilePath}.`);
            } else {
                console.log(`⚠️ Tailwind directives already exist in ${cssFilePath}. Skipping.`);
            }
        }

        console.log(`🎉 Frontend project "${projectName}" initialized successfully!`);
    } catch (error) {
        console.error('⚠️ Failed to initialize frontend:', error);
    }
}