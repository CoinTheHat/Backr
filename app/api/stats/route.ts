import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: Request) {
    // Note: This route is very specific to dashboard stats for a creator.
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creator') || searchParams.get('address');

    if (!creatorAddress) {
        return NextResponse.json({ error: 'Creator address required' }, { status: 400 });
    }

    try {
        // 1. Get ALL memberships (subscriptions)
        const allSubs = await db.memberships.getByCreator(creatorAddress);

        const now = new Date();

        // Filter logic:
        const validSubs = (allSubs || []).filter((sub: any) => {
            const isExpired = new Date(sub.expiresAt) < now;
            const isMock = sub.userAddress.startsWith('0x1010') ||
                sub.userAddress.startsWith('0x2020') ||
                sub.userAddress.startsWith('0x3030');
            return !isExpired && !isMock;
        });

        const membersCount = validSubs.length;

        // 2. Calculate Revenue
        const tiers = await db.tiers.getByCreator(creatorAddress);

        let totalRevenue = 0;

        if (tiers && validSubs.length > 0) {
            validSubs.forEach((sub: any) => {
                // TierID is string in our DB but might be mapped from index in frontend previously.
                // We check if tiers have numeric prices.
                // Simple Match:
                const tier = tiers.find((t: any) => String(t.id) === String(sub.tierId));
                if (tier) {
                    totalRevenue += parseFloat(tier.price || '0');
                } else if (sub.tierName) {
                    // Fallback
                    const t = tiers.find((t: any) => t.name === sub.tierName);
                    if (t) totalRevenue += parseFloat(t.price || '0');
                } else {
                    // Try index based fallback if tiers are ordered?
                    // Not reliable in DB. Assume 0.
                }
            });
        }

        // 3. Generate Synthetic History (for Chart)
        const history = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = now.getMonth();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), currentMonth - i, 1);
            const rev = (i === 0) ? totalRevenue : 0; // Simple logic from original

            history.push({
                name: months[d.getMonth()],
                revenue: parseFloat(rev.toFixed(2))
            });
        }

        // 4. Checklist Data
        const creatorProfile = await db.creators.find(creatorAddress);
        const profileSet = !!(creatorProfile && creatorProfile.name);
        const isDeployed = !!(creatorProfile && creatorProfile.contractAddress);

        const allPosts = await db.posts.getByCreator(creatorAddress);
        const postsCount = allPosts ? allPosts.length : 0;
        const hasPosts = postsCount > 0;
        const activeDiscussions = postsCount; // Approximation

        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const likesThisWeek = (allPosts || [])
            .filter((p: any) => new Date(p.createdAt) > oneWeekAgo)
            .reduce((sum: number, p: any) => sum + (p.likes || 0), 0);

        // Top Tier Members
        let topTierName = '';
        let maxPrice = -1;
        if (tiers) {
            tiers.forEach((t: any) => {
                const p = parseFloat(t.price || '0');
                if (p > maxPrice) {
                    maxPrice = p;
                    topTierName = t.name;
                }
            });
        }

        let topTierMembers = 0;
        if (topTierName) {
            // We need to match validSubs to topTierName
            // This requires tiers mapping again
            topTierMembers = validSubs.filter((sub: any) => {
                const tier = tiers.find((t: any) => String(t.id) === String(sub.tierId));
                return tier?.name === topTierName || sub.tierName === topTierName;
            }).length;
        }

        const hasTiers = (tiers && tiers.length > 0);

        return NextResponse.json({
            contractAddress: creatorProfile?.contractAddress,
            totalRevenue: totalRevenue,
            monthlyRecurring: totalRevenue,
            activeMembers: membersCount,
            history,
            checklist: {
                profileSet,
                isDeployed,
                hasTiers,
                hasPosts
            },
            // Dashboard Stats
            totalBackrs: membersCount,
            activeDiscussions,
            likesThisWeek,
            topTierMembers
        });

    } catch (error: any) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
