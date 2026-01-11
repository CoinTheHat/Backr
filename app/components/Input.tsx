export default function Input({ label, ...props }: any) {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px',
    };

    const labelStyle = {
        fontSize: '0.875rem',
        color: '#a1a1aa',
        fontWeight: '500',
    };

    const inputStyle = {
        background: '#0f1115',
        border: '1px solid #2e333d',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        width: '100%',
    };

    return (
        <div style={containerStyle as any}>
            {label && <label style={labelStyle}>{label}</label>}
            <input
                style={{ ...inputStyle, ...props.style }}
                onFocus={(e) => e.target.style.borderColor = '#65b3ad'}
                onBlur={(e) => e.target.style.borderColor = '#2e333d'}
                {...props}
            />
        </div>
    );
}
