export default function Card({ children, className = '', noHover = false, ...props }: any) {
    const styles: any = {
        background: 'rgba(26, 29, 36, 0.4)', // More transparent for glass feel
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(101, 179, 173, 0.1)', // Subtle teal tint on border
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ...props.style
    };

    // Hover effect logic handled via className or inline styles if we were using CSS-in-JS fully.
    // Since we are using inline styles mostly, we'll add a simple class for hover if needed or just rely on the parent passing hover transforms.
    // But to make it "cafcaf" universally:

    // We will apply a className that we defined in globals.css or just add a helper here.
    // Ideally we use a wrapper, but for MVP speed let's just use the style.

    // Actually, let's add a "group" class and rely on globals if we can, or just keep it simple.
    // Let's add an explicit "card-hover" class if not disabled.

    return (
        <div
            style={styles}
            className={`${className} ${!noHover ? 'card-interactive' : ''}`}
            onMouseEnter={(e) => {
                if (noHover) return;
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 20px 30px -5px rgba(0, 0, 0, 0.2), 0 0 30px rgba(101, 179, 173, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(101, 179, 173, 0.6)';
            }}
            onMouseLeave={(e) => {
                if (noHover) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(101, 179, 173, 0.1)';
            }}
            {...props}
        >
            {/* Top Shine Effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                opacity: 0.5
            }}></div>

            {children}
        </div>
    );
}
