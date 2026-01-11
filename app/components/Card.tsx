export default function Card({ children, className = '', noHover = false, variant = 'glass', ...props }: any) {
    const baseStyles: any = {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px',
        padding: '24px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        ...props.style
    };

    const variants: any = {
        glass: {
            background: 'rgba(13, 13, 18, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        },
        'neon-blue': {
            // Gradient from bottom accent to transparent top
            background: 'linear-gradient(180deg, rgba(13, 13, 18, 0.8) 0%, rgba(56, 189, 248, 0.15) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.15), inset 0 0 0 1px rgba(56, 189, 248, 0.1)',
        },
        'neon-pink': {
            background: 'linear-gradient(180deg, rgba(13, 13, 18, 0.8) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.15), inset 0 0 0 1px rgba(236, 72, 153, 0.1)',
        },
        'neon-green': {
            background: 'linear-gradient(180deg, rgba(13, 13, 18, 0.8) 0%, rgba(34, 197, 94, 0.15) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.15), inset 0 0 0 1px rgba(34, 197, 94, 0.1)',
        }
    };

    const styles = { ...baseStyles, ...variants[variant] };

    return (
        <div
            style={styles}
            className={`${className} ${!noHover ? 'card-interactive' : ''}`}
            onMouseEnter={(e) => {
                if (noHover) return;
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                if (variant === 'glass') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                } else if (variant === 'neon-blue') {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(76, 201, 240, 0.4), inset 0 0 30px rgba(76, 201, 240, 0.1)';
                } else if (variant === 'neon-pink') {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(247, 37, 133, 0.4), inset 0 0 30px rgba(247, 37, 133, 0.1)';
                } else if (variant === 'neon-green') {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(56, 176, 0, 0.4), inset 0 0 30px rgba(56, 176, 0, 0.1)';
                }
            }}
            onMouseLeave={(e) => {
                if (noHover) return;
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                // Reset to original variant style (hacky but works for inline)
                // In production use CSS classes!
                const v = variants[variant];
                e.currentTarget.style.borderColor = v.border.split(' ')[2] + ' ' + v.border.split(' ')[3] + ' ' + v.border.split(' ')[4]; // Reset border color roughly
                // Actually safer to just clear manual overrides and let React/CSS handle, but for this:
                e.currentTarget.style.boxShadow = v.boxShadow;
                e.currentTarget.style.borderColor = variant === 'glass' ? 'rgba(255, 255, 255, 0.08)' :
                    variant === 'neon-blue' ? 'rgba(76, 201, 240, 0.3)' :
                        variant === 'neon-pink' ? 'rgba(247, 37, 133, 0.3)' :
                            'rgba(56, 176, 0, 0.3)';
            }}
            {...props}
        >
            {/* Top Shine */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', opacity: 0.5
            }}></div>
            {children}
        </div>
    );
}
