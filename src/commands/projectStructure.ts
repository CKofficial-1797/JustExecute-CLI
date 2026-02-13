import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export async function createProjectStructure(baseName: string, folders: string[]) {
    for (const folder of folders) {
        const dirPath = `${baseName}/${folder}`;

        if (!existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        } else {
            console.log(`Directory already exists: ${dirPath}`);
        }
    }
}
