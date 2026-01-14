import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creator') || searchParams.get('address');

    if (!creatorAddress) {
        return NextResponse.json({ error: 'Creator address required' }, { status: 400 });
    }

    // 1. Get ALL subscriptions to filter manually for accuracy
    const { data: allSubs, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .ilike('creatorAddress', creatorAddress);

    if (subError) {
        console.error('Stats error (subs):', subError);
    }

    const now = new Date();

    // Filter logic:
    // 1. Must be Active (expiresAt > now)
    // 2. Must not be a mock test user (0x1010, 0x2020 etc)
    const validSubs = (allSubs || []).filter((sub: any) => {
        const isExpired = new Date(sub.expiresAt) < now;
        const isMock = sub.subscriberAddress.startsWith('0x1010') ||
            sub.subscriberAddress.startsWith('0x2020') ||
            sub.subscriberAddress.startsWith('0x3030');
        return !isExpired && !isMock;
    });

    const membersCount = validSubs.length;

    // 2. Calculate Revenue
    // Fetch tiers to map price
    const { data: tiers } = await supabase
        .from('tiers')
        .select('name, price')
        .eq('creatorAddress', creatorAddress);

    let totalRevenue = 0;

    if (tiers && validSubs.length > 0) {
        // Tiers usually don't have IDs in this schema (index based), so we try to match by name or index
        // But since we rely on `tierId` now:
        validSubs.forEach((sub: any) => {
            if (typeof sub.tierId === 'number' && tiers[sub.tierId]) {
                totalRevenue += parseFloat(tiers[sub.tierId].price);
            } else if (sub.tierName) {
                // Fallback by name
                const t = tiers.find((t: any) => t.name === sub.tierName);
                if (t) totalRevenue += parseFloat(t.price);
            }
        });
    }

    // 3. Generate Synthetic History (for Chart)
    const history = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();

    // Generate last 6 months - CLEAN DATA ONLY (No random noise)
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), currentMonth - i, 1);

        // Since we don't have historical data in this simple demo schema, 
        // we only show the current Total Revenue for the current month.
        // Past months are 0 to accurately reflect "no data recorded".
        const rev = (i === 0) ? totalRevenue : 0;

        history.push({
            name: months[d.getMonth()],
            revenue: parseFloat(rev.toFixed(2))
        });
    }

    // 4. Checklist Data
    // Check Profile and Contract
    const { data: creatorProfile } = await supabase.from('creators').select('name, contractAddress').eq('address', creatorAddress).single();
    const profileSet = !!(creatorProfile && creatorProfile.name);
    const isDeployed = !!(creatorProfile && creatorProfile.contractAddress);

    // Check Posts
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author', creatorAddress);
    const hasPosts = (postsCount || 0) > 0;

    // Check Tiers
    const hasTiers = (tiers && tiers.length > 0);

    return NextResponse.json({
        contractAddress: creatorProfile?.contractAddress,
        totalRevenue: totalRevenue, // Currently same as MRR in this simple logic, or 0 if we don't track historicals
        monthlyRecurring: totalRevenue,
        activeMembers: membersCount,
        history,
        checklist: {
            profileSet,
            isDeployed,
            hasTiers,
            hasPosts
        }
    });
}
