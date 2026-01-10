import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');

// Ensure DB Dir exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

function getTable(tableName: string) {
    const filePath = path.join(DB_DIR, `${tableName}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveTable(tableName: string, data: any[]) {
    const filePath = path.join(DB_DIR, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const db = {
    creators: {
        getAll: () => getTable('creators'),
        find: (address: string) => getTable('creators').find((c: any) => c.address === address),
        create: (creator: any) => {
            const all = getTable('creators');
            const exists = all.find((c: any) => c.address === creator.address);
            if (exists) {
                // Update
                Object.assign(exists, creator);
                saveTable('creators', all);
            } else {
                all.push({ ...creator, createdAt: new Date().toISOString() });
                saveTable('creators', all);
            }
            return creator;
        }
    },
    tiers: {
        // Tiers often linked to creator address in this simple model
        getByCreator: (address: string) => getTable('tiers').filter((t: any) => t.creatorAddress === address),
        saveAll: (address: string, newTiers: any[]) => {
            const all = getTable('tiers').filter((t: any) => t.creatorAddress !== address);
            const toSave = newTiers.map(t => ({ ...t, creatorAddress: address, id: t.id || Math.random().toString(36).substr(2, 9) }));
            saveTable('tiers', [...all, ...toSave]);
        }
    },
    posts: {
        getAll: () => getTable('posts'),
        create: (post: any) => {
            const all = getTable('posts');
            const newPost = { ...post, id: Math.random().toString(36).substr(2, 9) };
            all.push(newPost);
            saveTable('posts', all);
            return newPost;
        }
    }
};
