import { select } from '@inquirer/prompts';
import { execPromise } from '../utils';
import fs from 'fs/promises';
import path from 'path';

export async function initBackend(targetPath: string, standalone = true) {
    const framework = await select({
        message: 'Select backend framework',
        choices: [
            { name: 'Express.js', value: 'express' },
        ],
    });

    const includeTypescript = await select({
        message: 'Do you want to include TypeScript support?',
        choices: [
            { name: 'No', value: false },
            // { name: 'Yes', value: true },
        ],
    });

    const includeMorgan = await select({
        message: 'Do you want to include Morgan for logging?',
        choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
        ],
    });

    const includeCors = await select({
        message: 'Do you want to include CORS middleware?',
        choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
        ],
    });

    try {
        const backendDir = standalone ? targetPath : path.join(targetPath, 'backend');
        await fs.mkdir(backendDir, { recursive: true });

        const srcDir = path.join(backendDir, 'src');
        await fs.mkdir(srcDir, { recursive: true });

        await execPromise('npm init -y', { cwd: backendDir });
        await execPromise('npm install express', { cwd: backendDir });
        await execPromise('npm install nodemon --save-dev', { cwd: backendDir });

        if (includeMorgan) await execPromise('npm install morgan', { cwd: backendDir });
        if (includeCors) await execPromise('npm install cors', { cwd: backendDir });

        await createFolderStructure(srcDir);

        const tsConfigContent = includeTypescript
            ? {
                  compilerOptions: {
                      target: 'ES2020',
                      module: 'CommonJS',
                      rootDir: './src',
                      outDir: './dist',
                      strict: true,
                      esModuleInterop: true,
                      skipLibCheck: true,
                      forceConsistentCasingInFileNames: true,
                  },
                  include: ['src/**/*.ts'],
                  exclude: ['node_modules'],
              }
            : null;

        if (tsConfigContent) {
            await fs.writeFile(path.join(backendDir, 'tsconfig.json'), JSON.stringify(tsConfigContent, null, 2));
        }

        const serverTemplate = `
import express from 'express';
${includeCors ? "import cors from 'cors';" : ''}
${includeMorgan ? "import morgan from 'morgan';" : ''}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
${includeCors ? 'app.use(cors());' : ''}
${includeMorgan ? 'app.use(morgan("dev"));' : ''}
app.use(express.json());

app.get('/', (req, res) => {
    res.send('🚀 Welcome to the Express Server!');
});

app.listen(PORT, () => {
    console.log(\`🌟 Server is running on http://localhost:\${PORT}\`);
});
`;

        const serverFilePath = path.join(srcDir, includeTypescript ? 'server.ts' : 'server.js');
        await fs.writeFile(serverFilePath, serverTemplate);

        const packageJsonPath = path.join(backendDir, 'package.json');
        const packageJsonContent = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        packageJsonContent.type = 'module';
        packageJsonContent.scripts = {
            ...packageJsonContent.scripts,
            start: includeTypescript ? 'tsc && node dist/server.js' : 'node src/server.js',
            dev: includeTypescript ? 'ts-node src/server.ts' : 'nodemon src/server.js',
        };
        if (!includeTypescript) delete packageJsonContent.scripts.build;

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

        console.log(`🎉 Your backend project is set up at ${backendDir}!`);
    } catch (error) {
        console.error('⚠️ Failed to initialize backend:', error);
    }
}

async function createFolderStructure(baseDir: string) {
    const folders = ['controllers', 'routes', 'models', 'middleware'];
    for (const folder of folders) {
        await fs.mkdir(path.join(baseDir, folder), { recursive: true });
    }
}