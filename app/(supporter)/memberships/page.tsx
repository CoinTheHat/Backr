'use client';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { useRouter } from 'next/navigation';

export default function MyMembershipsPage() {
    const router = useRouter();

    // Mock Active Memberships (since we implemented simulated subscribe in [creator] page but didn't persist it globally to a user)
    // For demo purposes, if we have localstorage or just hardcode if "subscribed"
    const memberships = [
        // Empty for now for pure "New User" state, or mock one?
        // Let's keep empty to show the "Discover" CTA
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>My Memberships</h1>

            <div style={{ textAlign: 'center', padding: '64px', background: '#1a1d24', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>No active memberships</h3>
                <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Support your favorite creators to unlock exclusive content and join their communities.</p>
                <Button onClick={() => router.push('/')}>Discover Creators</Button>
            </div>
        </div>
    );
}
