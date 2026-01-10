export default function Button({ children, onClick, variant = 'primary', className = '', ...props }: any) {
    const baseStyle = "px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#65b3ad] text-white hover:bg-[#4d8f8a] focus:ring-[#65b3ad]",
        secondary: "bg-[#1a1d24] text-white border border-[#2e333d] hover:border-[#65b3ad] focus:ring-[#2e333d]",
        outline: "bg-transparent text-[#65b3ad] border border-[#65b3ad] hover:bg-[#65b3ad] hover:text-white"
    };

    // Note: Since we are not using Tailwind, we need inline styles or global CSS classes. 
    // However, for this Hackathon MVP with "Vanilla CSS" requirement but creating Next.js app, 
    // I will use inline styles mapping for simplicity if Tailwind is disabled, 
    // OR rely on the globals.css classes I should define.

    // Actually, I should use CSS modules or global classes. 
    // Let's use inline styles tailored for the "premium" feel to ensure it looks good immediately without complex CSS file management for now.

    const styles: any = {
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    };

    if (variant === 'primary') {
        styles.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)';
        styles.color = '#fff';
        styles.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.1)';
        styles.border = '1px solid rgba(139, 92, 246, 0.5)';
        styles.backdropFilter = 'blur(10px)';
    } else if (variant === 'secondary') {
        styles.background = 'rgba(255, 255, 255, 0.05)';
        styles.color = '#fff';
        styles.border = '1px solid rgba(255, 255, 255, 0.1)';
        styles.backdropFilter = 'blur(10px)';
    } else if (variant === 'outline') {
        styles.background = 'transparent';
        styles.color = '#14b8a6';
        styles.border = '1px solid #14b8a6';
    }

    const handleMouseEnter = (e: any) => {
        if (props.disabled) return;
        if (variant === 'primary') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.8)';
        } else {
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
        }
    };

    const handleMouseLeave = (e: any) => {
        if (props.disabled) return;
        if (variant === 'primary') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.1)';
            e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.5)';
        } else if (variant === 'secondary') {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }
    };

    return (
        <button
            onClick={onClick}
            style={{ ...styles, ...props.style }}
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </button>
    );
}
