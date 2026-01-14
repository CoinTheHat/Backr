import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    containerStyle?: React.CSSProperties;
}

export default function Input({ label, error, helperText, style, containerStyle, icon, ...props }: InputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '16px', ...containerStyle }}>
            {label && (
                <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)'
                }}>
                    {label}
                </label>
            )}

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    className="focus-ring"
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        paddingLeft: icon ? '40px' : '14px', // Adjust padding if icon exists
                        borderRadius: 'var(--radius-md)',
                        border: error ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
                        background: 'var(--color-bg-surface)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.925rem',
                        transition: 'all 0.2s ease',
                        ...style
                    }}
                    {...props}
                />
            </div>

            {helperText && !error && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{helperText}</span>
            )}
            {error && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{error}</span>
            )}
        </div>
    );
}
