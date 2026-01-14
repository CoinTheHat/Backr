/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
                serif: ["var(--font-playfair)", "serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    primary: "#FF6EB5", // Galaxy Pink
                    secondary: "#6B8BFF", // Nebula Blue
                    accent: "#88E9CE", // Starlight Cyan
                    dark: "#0D0B1D", // Cosmic Ink
                    light: "#F2F2FA", // Nebula Pastel
                    muted: "#94A3B8", // Slate 400
                },
            },
            boxShadow: {
                'studio': '0 4px 24px rgba(0,0,0,0.12)',
                'glow': '0 0 20px rgba(255, 110, 181, 0.5)',
            },
            borderRadius: {
                'studio': '16px',
            }
        },
    },
    plugins: [],
};
