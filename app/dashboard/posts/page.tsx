'use client';

import { useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { useAccount } from 'wagmi';

export default function PostsPage() {
    const { address } = useAccount();
    const [title, setTitle] = useState('');
    const [teaser, setTeaser] = useState('');
    const [content, setContent] = useState('');
    const [postImage, setPostImage] = useState('');
    const [saving, setSaving] = useState(false);
    const [visibility, setVisibility] = useState('members'); // public, members
    const [minTier, setMinTier] = useState<number>(0);
    const [creatorTiers, setCreatorTiers] = useState<any[]>([]);

    // Load tiers on mount
    useState(() => {
        if (!address) return;
        fetch(`/api/tiers?address=${address}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCreatorTiers(data);
            });
    });

    const handleCreatePost = async () => {
        if (!title || !content || !address) return;
        setSaving(true);

        await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creatorAddress: address,
                title,
                content,
                teaser,
                image: postImage,
                isPublic: visibility === 'public',
                minTier: visibility === 'public' ? 0 : minTier,
                createdAt: new Date().toISOString()
            })
        });

        setSaving(false);
        setTitle('');
        setContent('');
        setTeaser('');
        alert('Post created!');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Create Post</h1>

            <Card style={{ marginBottom: '48px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Input label="Post Title" value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="e.g. Weekly Update" />
                </div>

                {/* Visibility Selection */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '12px' }}>Who can see this?</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                            onClick={() => setVisibility('members')}
                            style={{
                                flex: 1,
                                padding: '16px',
                                border: visibility === 'members' ? '1px solid #65b3ad' : '1px solid #2e333d',
                                background: visibility === 'members' ? 'rgba(101, 179, 173, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: visibility === 'members' ? '#65b3ad' : '#fff' }}>🔒 Members Only</div>
                            <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Only active subscribers can read the full content.</div>
                        </div>

                        <div
                            onClick={() => setVisibility('public')}
                            style={{
                                flex: 1,
                                padding: '16px',
                                border: visibility === 'public' ? '1px solid #65b3ad' : '1px solid #2e333d',
                                background: visibility === 'public' ? 'rgba(101, 179, 173, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: visibility === 'public' ? '#65b3ad' : '#fff' }}>🌍 Public</div>
                            <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Visible to everyone. Good for announcements.</div>
                        </div>
                    </div>

                    {visibility === 'members' && creatorTiers.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px' }}>Minimum Tier Required</label>
                            <select
                                value={minTier}
                                onChange={(e) => setMinTier(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#1a1d24',
                                    border: '1px solid #2e333d',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            >
                                <option value={0}>All Tiers (Basic Access)</option>
                                {creatorTiers.map((tier, index) => (
                                    <option key={index} value={index + 1}>{tier.name} (Tier {index + 1})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {visibility === 'members' && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px' }}>Public Teaser (Optional)</label>
                        <textarea
                            value={teaser}
                            onChange={(e) => setTeaser(e.target.value)}
                            placeholder="A short preview shown to non-members to entice them to join..."
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                background: '#1a1d24',
                                border: '1px solid #2e333d',
                                borderRadius: '8px',
                                padding: '12px',
                                color: '#fff',
                                fontSize: '0.875rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px' }}>Post Image (Optional)</label>
                    {postImage ? (
                        <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', border: '1px solid #2e333d' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={postImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                onClick={() => setPostImage('')}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '120px', border: '2px dashed #2e333d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#1a1d24', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#65b3ad'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2e333d'}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setPostImage(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                                <span style={{ fontSize: '0.9rem' }}>Click or Drag image here</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px' }}>
                        {visibility === 'members' ? 'Restricted Content' : 'Post Content'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your exclusive content here..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            background: '#0f1115',
                            border: '1px solid #2e333d',
                            borderRadius: '8px',
                            padding: '16px',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <Button onClick={handleCreatePost} disabled={saving}>{saving ? 'Publishing...' : 'Publish Post'}</Button>
                </div>
            </Card>
        </div>
    );
}
