'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Types
export interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    tier: string;
}

export interface Tier {
    id: string;
    name: string;
    price: string;
    perks: string[];
}

interface Stats {
    totalBackrs: number;
    activeDiscussions: number;
    likesThisWeek: number;
    topTierMembers: number;
}

interface CommunityContextType {
    posts: Post[];
    tiers: Tier[];
    stats: Stats;
    isDeployed: boolean;
    contractAddress: string | null; // Added
    isLoading: boolean;
    refreshData: () => void;
    addPost: (content: string, tier: string) => void;
    addTier: (tier: Omit<Tier, 'id'>) => void;
    deleteTier: (id: string) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
    const { address } = useAccount();
    const [posts, setPosts] = useState<Post[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [isDeployed, setIsDeployed] = useState(false);
    const [contractAddress, setContractAddress] = useState<string | null>(null); // Added
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState<Stats>({
        totalBackrs: 0,
        activeDiscussions: 0,
        likesThisWeek: 0,
        topTierMembers: 0
    });

    const refreshData = () => {
        if (address) {
            setIsLoading(true);
            fetch(`/api/stats?creator=${address}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        if (data.checklist) setIsDeployed(!!data.checklist.isDeployed);
                        setContractAddress(data.contractAddress || null);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });
        }
    };

    useEffect(() => {
        refreshData();
    }, [address]);

    const addPost = (content: string, tier: string) => {
        // ...
        const newPost: Post = {
            id: Date.now().toString(),
            author: 'You', // The logged in user
            content,
            timestamp: 'Just now',
            likes: 0,
            tier
        };
        setPosts([newPost, ...posts]);
        setStats(prev => ({ ...prev, activeDiscussions: prev.activeDiscussions + 1 }));
    };

    const addTier = (tierData: Omit<Tier, 'id'>) => {
        const newTier: Tier = {
            ...tierData,
            id: Date.now().toString()
        };
        setTiers([...tiers, newTier]);
    };

    const deleteTier = (id: string) => {
        setTiers(tiers.filter(t => t.id !== id));
    };

    return (
        <CommunityContext.Provider value={{ posts, tiers, stats, isDeployed, contractAddress, isLoading, addPost, addTier, deleteTier, refreshData }}>
            {children}
        </CommunityContext.Provider>
    );
}

export function useCommunity() {
    const context = useContext(CommunityContext);
    if (context === undefined) {
        throw new Error('useCommunity must be used within a CommunityProvider');
    }
    return context;
}
