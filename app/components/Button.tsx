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
        styles.background = 'linear-gradient(135deg, #65b3ad 0%, #4d8f8a 100%)';
        styles.color = '#fff';
        styles.boxShadow = '0 0 10px rgba(101, 179, 173, 0.4)'; // Initial glow
        styles.border = '1px solid rgba(255,255,255,0.1)';
    } else if (variant === 'secondary') {
        styles.background = 'rgba(26, 29, 36, 0.8)';
        styles.color = '#fff';
        styles.border = '1px solid #2e333d';
    } else if (variant === 'outline') {
        styles.background = 'transparent';
        styles.color = '#65b3ad';
        styles.border = '1px solid #65b3ad';
    }

    const handleMouseEnter = (e: any) => {
        if (props.disabled) return;
        if (variant === 'primary') {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(101, 179, 173, 0.6)'; // Intense glow
        } else {
            e.currentTarget.style.borderColor = '#65b3ad';
            e.currentTarget.style.color = '#65b3ad'; // Ensure text colors on hover for secondary
        }
    };

    const handleMouseLeave = (e: any) => {
        if (props.disabled) return;
        if (variant === 'primary') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(101, 179, 173, 0.4)';
        } else if (variant === 'secondary') {
            e.currentTarget.style.borderColor = '#2e333d';
            e.currentTarget.style.color = '#fff';
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
