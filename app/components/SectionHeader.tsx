import React from 'react';
import Button from './Button';

interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    };
    children?: React.ReactNode; // For custom actions
}

export default function SectionHeader({ title, description, action, children }: SectionHeaderProps) {
    return (
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <h2 className="text-h2" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>{title}</h2>
                {description && <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', maxWidth: '600px' }}>{description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                {children}
                {action && (
                    <Button onClick={action.onClick} variant={action.variant || "primary"} leftIcon={action.icon}>
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
