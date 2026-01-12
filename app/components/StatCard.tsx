import React from 'react';
import Card from './Card';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ label, value, subtext, icon, trend }: StatCardProps) {
    return (
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {icon && (
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'var(--color-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-secondary)', fontSize: '1.2rem'
                    }}>
                        {icon}
                    </div>
                )}
                <div className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</div>
            </div>

            <div className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {value}
            </div>

            {subtext && (
                <div className="text-caption" style={{
                    color: trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    {trend === 'up' && '↑'}
                    {trend === 'down' && '↓'}
                    {subtext}
                </div>
            )}
        </Card>
    );
}
