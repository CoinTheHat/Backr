import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:dtxrLhgNbVRSceACyImtLEBcELdghdzH@trolley.proxy.rlwy.net:53433/railway',
    ssl: { rejectUnauthorized: false }
});

// Initialize tables
const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS creators (
                address TEXT PRIMARY KEY,
                name TEXT,
                bio TEXT,
                description TEXT,
                "profileImage" TEXT,
                "coverImage" TEXT,
                email TEXT,
                "avatarUrl" TEXT,
                socials JSONB,
                "payoutToken" TEXT,
                "contractAddress" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tiers (
                id TEXT PRIMARY KEY,
                "creatorAddress" TEXT REFERENCES creators(address),
                name TEXT,
                price NUMERIC,
                description TEXT,
                perks JSONB,
                image TEXT
            );

            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                "creatorAddress" TEXT REFERENCES creators(address),
                title TEXT,
                content TEXT,
                image TEXT,
                "videoUrl" TEXT,
                "minTier" INTEGER,
                likes INTEGER DEFAULT 0,
                "isPublic" BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tips (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                sender TEXT,
                receiver TEXT REFERENCES creators(address),
                amount NUMERIC,
                currency TEXT,
                message TEXT,
                timestamp TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS memberships (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                "userAddress" TEXT,
                "creatorAddress" TEXT REFERENCES creators(address),
                "tierId" INTEGER,
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        `);
    } catch (err) {
        console.error('Error initializing DB:', err);
    } finally {
        client.release();
    }
};

// Run init on import (or you could call this explicitly)
initDb();

export const db = {
    creators: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM creators');
            return res.rows;
        },
        find: async (address: string) => {
            const res = await pool.query('SELECT * FROM creators WHERE address = $1', [address]);
            return res.rows[0];
        },
        create: async (creator: any) => {
            const { address, name, bio, profileImage, coverImage, email } = creator;
            const query = `
                INSERT INTO creators (address, name, bio, "profileImage", "coverImage", email, "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (address) DO UPDATE 
                SET name = $2, bio = $3, "profileImage" = $4, "coverImage" = $5, email = $6, "updatedAt" = NOW()
                RETURNING *;
            `;
            const res = await pool.query(query, [address, name, bio, profileImage, coverImage, email]);
            return res.rows[0];
        }
    },
    tiers: {
        getByCreator: async (address: string) => {
            const res = await pool.query('SELECT * FROM tiers WHERE "creatorAddress" = $1', [address]);
            return res.rows;
        },
        saveAll: async (address: string, newTiers: any[]) => {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM tiers WHERE "creatorAddress" = $1', [address]);
                for (const tier of newTiers) {
                    await client.query(
                        'INSERT INTO tiers (id, "creatorAddress", name, price, description, perks, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [tier.id || Math.random().toString(36).substr(2, 9), address, tier.name, tier.price, tier.description, JSON.stringify(tier.perks), tier.image]
                    );
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        }
    },
    posts: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM posts ORDER BY "createdAt" DESC');
            return res.rows;
        },
        getByCreator: async (address: string) => {
            const res = await pool.query('SELECT * FROM posts WHERE "creatorAddress" = $1 ORDER BY "createdAt" DESC', [address]);
            return res.rows;
        },
        create: async (post: any) => {
            const query = `
                INSERT INTO posts ("creatorAddress", title, content, image, "videoUrl", "minTier", "isPublic", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING *;
            `;
            const res = await pool.query(query, [
                post.creatorAddress, post.title, post.content, post.image, post.videoUrl, post.minTier, post.isPublic
            ]);
            return res.rows[0];
        }
    },
    tips: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM tips ORDER BY timestamp DESC');
            return res.rows;
        },
        getByReceiver: async (address: string) => {
            const res = await pool.query('SELECT * FROM tips WHERE receiver = $1 ORDER BY timestamp DESC', [address]);
            return res.rows;
        },
        create: async (tip: any) => {
            const query = `
                INSERT INTO tips (sender, receiver, amount, currency, message, timestamp)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *;
            `;
            const res = await pool.query(query, [tip.sender, tip.receiver, tip.amount, tip.currency, tip.message]);
            return res.rows[0];
        }
    },
    memberships: {
        getByUser: async (address: string) => {
            const res = await pool.query('SELECT * FROM memberships WHERE "userAddress" = $1', [address]);
            return res.rows;
        },
        getByCreator: async (address: string) => {
            const res = await pool.query('SELECT * FROM memberships WHERE "creatorAddress" = $1', [address]);
            return res.rows;
        },
        create: async (membership: any) => {
            const query = `
                INSERT INTO memberships ("userAddress", "creatorAddress", "tierId", "expiresAt", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT DO NOTHING
                RETURNING *; 
            `;
            // Note: simple schema above doesn't have unique constraint, so ON CONFLICT might need a Unique Index.
            // For now just insert. 
            const insertQuery = `
                INSERT INTO memberships ("userAddress", "creatorAddress", "tierId", "expiresAt", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *;
            `;
            const res = await pool.query(insertQuery, [membership.userAddress, membership.creatorAddress, membership.tierId, membership.expiresAt]);
            return res.rows[0];
        }
    }
};
