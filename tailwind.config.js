/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#8c2bee",
                "primary-light": "#a74bfb",
                "primary-dark": "#711ec3",
                "secondary": "#0EA5E9",
                "accent": "#F59E0B",
                "mist": "#F8F9FC",
                "fuchsia-accent": "#e879f9",
                "brand-dark": "#0D0B1D",
                "brand-primary": "#6B8BFF",
                "brand-secondary": "#FF6EB5",
                "brand-accent": "#88E9CE",
                "brand-light": "#F2F2FA",
            },
            fontFamily: {
                "sans": ["var(--font-inter)", "sans-serif"],
                "serif": ["var(--font-playfair)", "serif"],
                "display": ["var(--font-playfair)", "serif"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
            },
            boxShadow: {
                "glow": "0 0 20px rgba(140, 43, 238, 0.3)",
                "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "fade-in-up": "fadeInUp 0.8s ease-out forwards",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                }
            }
        },
    },
    plugins: [],
};
