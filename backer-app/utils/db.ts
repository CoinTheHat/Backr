import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : process.env.DATABASE_URL?.includes('rds.amazonaws.com') || process.env.DATABASE_URL?.includes('supabase.co')
            ? { rejectUnauthorized: true }
            : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Initialize tables
const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS creators (
                address TEXT PRIMARY KEY,
                username TEXT UNIQUE,
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
            
            -- Add username column if it doesn't exist (for existing tables)
            ALTER TABLE creators
            ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

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
                "txHash" TEXT,
                timestamp TIMESTAMP DEFAULT NOW()
            );

            -- Add txHash column if it doesn't exist (for existing tables)
            ALTER TABLE tips
            ADD COLUMN IF NOT EXISTS "txHash" TEXT;

            CREATE TABLE IF NOT EXISTS memberships (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                "userAddress" TEXT,
                "creatorAddress" TEXT REFERENCES creators(address),
                "tierId" INTEGER,
                "expiresAt" TIMESTAMP,
                "txHash" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );

            -- Add txHash column if it doesn't exist (for existing tables)
            ALTER TABLE memberships
            ADD COLUMN IF NOT EXISTS "txHash" TEXT;

            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                icon TEXT,
                "sortOrder" INTEGER DEFAULT 0,
                "isActive" BOOLEAN DEFAULT TRUE,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS hashtags (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL, 
                slug TEXT UNIQUE NOT NULL, 
                "sortOrder" INTEGER DEFAULT 0,
                "isActive" BOOLEAN DEFAULT TRUE,
                "isTrending" BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                "postId" TEXT REFERENCES posts(id) ON DELETE CASCADE,
                "userAddress" TEXT,
                content TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW()
            );
        `);
    } catch (err) {
        console.error('Error initializing DB:', err);
    } finally {
        client.release();
    }
};

// Run init on import (or you could call this explicitly)
// Only run if we have a database URL, and don't crash if it fails (e.g. during build)
/*
if (process.env.DATABASE_URL) {
    initDb().catch(e => {
        console.warn("Failed to initialize DB (this is expected during build):", e.message);
    });
}
*/

export const db = {
    creators: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM creators');
            return res.rows;
        },
        find: async (address: string) => {
            const res = await pool.query('SELECT * FROM creators WHERE address = $1', [address.toLowerCase()]);
            return res.rows[0];
        },
        findByUsername: async (username: string) => {
            const res = await pool.query('SELECT * FROM creators WHERE LOWER(username) = LOWER($1)', [username]);
            return res.rows[0];
        },
        create: async (creator: any) => {
            const { address, username, name, bio, profileImage, coverImage, email, avatarUrl } = creator;
            // Sync avatar fields for compatibility across different components
            const finalAvatar = avatarUrl || profileImage || '';

            const query = `
                INSERT INTO creators (address, username, name, bio, "profileImage", "coverImage", email, "avatarUrl", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                ON CONFLICT (address) DO UPDATE
                SET 
                    username = $2, 
                    name = COALESCE(NULLIF($3, ''), creators.name), 
                    bio = COALESCE(NULLIF($4, ''), creators.bio), 
                    "profileImage" = CASE WHEN $5 <> '' THEN $5 ELSE creators."profileImage" END,
                    "coverImage" = CASE WHEN $6 <> '' THEN $6 ELSE creators."coverImage" END,
                    email = COALESCE(NULLIF($7, ''), creators.email), 
                    "avatarUrl" = CASE WHEN $8 <> '' THEN $8 ELSE creators."avatarUrl" END,
                    "updatedAt" = NOW()
                RETURNING *;
            `;
            const res = await pool.query(query, [address.toLowerCase(), username, name, bio, finalAvatar, coverImage, email, finalAvatar]);
            return res.rows[0];
        },
        updateSocials: async (address: string, socials: any) => {
            const query = `
                UPDATE creators 
                SET socials = $2, "updatedAt" = NOW()
                WHERE LOWER(address) = LOWER($1)
                RETURNING *;
            `;
            const res = await pool.query(query, [address, socials]);
            return res.rows[0];
        }
    },
    tiers: {
        getByCreator: async (address: string) => {
            const res = await pool.query('SELECT * FROM tiers WHERE LOWER("creatorAddress") = LOWER($1)', [address]);
            return res.rows;
        },
        saveAll: async (address: string, newTiers: any[]) => {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM tiers WHERE LOWER("creatorAddress") = LOWER($1)', [address]);
                for (const tier of newTiers) {
                    await client.query(
                        'INSERT INTO tiers (id, "creatorAddress", name, price, description, perks, image) VALUES ($1, LOWER($2), $3, $4, $5, $6, $7)',
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
            const res = await pool.query('SELECT * FROM posts WHERE LOWER("creatorAddress") = LOWER($1) ORDER BY "createdAt" DESC', [address]);
            return res.rows;
        },
        getById: async (id: string) => {
            const res = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
            return res.rows[0];
        },
        create: async (post: any) => {
            const query = `
                INSERT INTO posts ("creatorAddress", title, content, image, "videoUrl", "minTier", "isPublic", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING *;
            `;
            const res = await pool.query(query, [
                post.creatorAddress.toLowerCase(), post.title, post.content, post.image, post.videoUrl, post.minTier, post.isPublic
            ]);
            return res.rows[0];
        },
        update: async (id: string, post: any) => {
            const query = `
                UPDATE posts 
                SET title = $2, content = $3, image = $4, "videoUrl" = $5, "minTier" = $6, "isPublic" = $7
                WHERE id = $1
                RETURNING *;
            `;
            const res = await pool.query(query, [
                id, post.title, post.content, post.image, post.videoUrl, post.minTier, post.isPublic
            ]);
            return res.rows[0];
        },
        async delete(id: string) {
            const res = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
            return res.rows[0];
        },
        async like(id: string) {
            const res = await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes', [id]);
            return res.rows[0];
        }
    },
    comments: {
        getByPost: async (postId: string) => {
            const res = await pool.query(`
                SELECT c.*, cr.username, cr."avatarUrl" 
                FROM comments c
                LEFT JOIN creators cr ON c."userAddress" = cr.address
                WHERE c."postId" = $1 
                ORDER BY c."createdAt" ASC
            `, [postId]);
            return res.rows;
        },
        create: async (comment: { postId: string, userAddress: string, content: string }) => {
            const res = await pool.query(
                'INSERT INTO comments ("postId", "userAddress", content) VALUES ($1, $2, $3) RETURNING *',
                [comment.postId, comment.userAddress.toLowerCase(), comment.content]
            );
            return res.rows[0];
        }
    },
    taxonomy: {
        categories: {
            getAll: async () => {
                const res = await pool.query('SELECT * FROM categories ORDER BY "sortOrder" ASC');
                return res.rows;
            },
            create: async (name: string, slug: string) => {
                const res = await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *', [name, slug]);
                return res.rows[0];
            },
            delete: async (id: string) => {
                await pool.query('DELETE FROM categories WHERE id = $1', [id]);
            },
            toggleActive: async (id: string, isActive: boolean) => {
                const res = await pool.query('UPDATE categories SET "isActive" = $2 WHERE id = $1 RETURNING *', [id, isActive]);
                return res.rows[0];
            },
            update: async (id: string, updates: any) => {
                const { name, icon, sortOrder, isActive } = updates;
                const query = `
                    UPDATE categories 
                    SET 
                        name = COALESCE($2, name),
                        icon = COALESCE($3, icon), 
                        "sortOrder" = COALESCE($4, "sortOrder"),
                        "isActive" = COALESCE($5, "isActive"),
                        "updatedAt" = NOW()
                    WHERE id = $1
                    RETURNING *;
                `;
                const res = await pool.query(query, [id, name, icon, sortOrder, isActive]);
                return res.rows[0];
            }
        },
        hashtags: {
            getAll: async () => {
                const res = await pool.query('SELECT * FROM hashtags ORDER BY "sortOrder" ASC');
                return res.rows;
            },
            create: async (name: string, slug: string) => {
                const res = await pool.query('INSERT INTO hashtags (name, slug) VALUES ($1, $2) RETURNING *', [name, slug]);
                return res.rows[0];
            },
            delete: async (id: string) => {
                await pool.query('DELETE FROM hashtags WHERE id = $1', [id]);
            },
            toggleTrending: async (id: string, isTrending: boolean) => {
                const res = await pool.query('UPDATE hashtags SET "isTrending" = $2 WHERE id = $1 RETURNING *', [id, isTrending]);
                return res.rows[0];
            },
            update: async (id: string, updates: any) => {
                const { label, sortOrder, isActive, isTrending } = updates;
                // Note: label maps to name in DB
                const query = `
                    UPDATE hashtags 
                    SET 
                        name = COALESCE($2, name),
                        "sortOrder" = COALESCE($3, "sortOrder"),
                        "isActive" = COALESCE($4, "isActive"),
                        "isTrending" = COALESCE($5, "isTrending"),
                         "updatedAt" = NOW()
                    WHERE id = $1
                    RETURNING *;
                `;
                const res = await pool.query(query, [id, label, sortOrder, isActive, isTrending]);
                return res.rows[0];
            }
        }
    },
    stats: {
        getCounts: async () => {
            const creators = await pool.query('SELECT COUNT(*) FROM creators');
            const posts = await pool.query('SELECT COUNT(*) FROM posts');
            const tips = await pool.query('SELECT COUNT(*) FROM tips');
            const volume = await pool.query('SELECT SUM(amount) FROM tips');
            return {
                creators: parseInt(creators.rows[0].count),
                posts: parseInt(posts.rows[0].count),
                tips: parseInt(tips.rows[0].count),
                volume: parseFloat(volume.rows[0].sum || '0')
            };
        }
    },
    tips: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM tips ORDER BY timestamp DESC');
            return res.rows;
        },
        getByReceiver: async (address: string) => {
            const res = await pool.query('SELECT * FROM tips WHERE LOWER(receiver) = LOWER($1) ORDER BY timestamp DESC', [address]);
            return res.rows;
        },
        getBySender: async (address: string) => {
            const res = await pool.query('SELECT * FROM tips WHERE LOWER(sender) = LOWER($1) ORDER BY timestamp DESC', [address]);
            return res.rows;
        },
        create: async (tip: any) => {
            const query = `
                INSERT INTO tips (sender, receiver, amount, currency, message, "txHash", timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING *;
            `;
            const res = await pool.query(query, [
                tip.sender.toLowerCase(),
                tip.receiver.toLowerCase(),
                tip.amount,
                tip.currency || 'USDC',
                tip.message,
                tip.txHash || null
            ]);
            return res.rows[0];
        }
    },
    memberships: {
        getAll: async () => {
            const res = await pool.query('SELECT * FROM memberships ORDER BY "createdAt" DESC');
            return res.rows;
        },
        getByUser: async (address: string) => {
            const query = `
                SELECT m.*, c.name as "creatorName", c.username as "creatorUsername", c."avatarUrl" as "creatorAvatar", c."profileImage" as "creatorProfileImage"
                FROM memberships m
                LEFT JOIN creators c ON m."creatorAddress" = c.address
                WHERE m."userAddress" = $1
                ORDER BY m."createdAt" DESC
            `;
            const res = await pool.query(query, [address.toLowerCase()]);
            return res.rows;
        },
        getByCreator: async (address: string) => {
            const res = await pool.query('SELECT * FROM memberships WHERE LOWER("creatorAddress") = LOWER($1)', [address]);
            return res.rows;
        },
        create: async (membership: any) => {
            const query = `
                INSERT INTO memberships ("userAddress", "creatorAddress", "tierId", "expiresAt", "txHash", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                RETURNING *;
            `;
            const res = await pool.query(query, [
                membership.userAddress.toLowerCase(),
                membership.creatorAddress.toLowerCase(),
                membership.tierId,
                membership.expiresAt,
                membership.txHash || null
            ]);
            return res.rows[0];
        }
    }
};
